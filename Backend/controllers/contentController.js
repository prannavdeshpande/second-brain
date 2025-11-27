const Content = require('../models/Content');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { ingestContent } = require('../services/mlService');

/**
 * Helper function to create an activity log for a user action.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} action - The type of action (e.g., 'add_content').
 * @param {string|null} contentId - The ID of the content related to the action.
 */
const logActivity = async (userId, action, contentId = null) => {
  try {
    await Activity.create({ user: userId, action, content: contentId });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// ## -------------------
// ## CORE CONTENT CRUD
// ## --------------------

/**
 * @desc    Upload content (file or URL), process it with the ML service, and save metadata.
 * @route   POST /api/content
 * @access  Private
 */
exports.uploadContent = async (req, res) => {
  try {
    const { url, title, description, tags } = req.body;
    const file = req.file;

    if (!file && !url) {
      return res.status(400).json({ success: false, message: 'Please provide a file or a URL' });
    }
    if (!title) {
        return res.status(400).json({ success: false, message: 'A title is required for the content' });
    }

    // 1. Call the Python ML service to process the content
    const mlServicePayload = file ? { file } : { url };
    const mlResponse = await ingestContent(mlServicePayload);

    // 2. Create the content record in our MongoDB
    const contentData = {
      user: req.user.id,
      title,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      contentType: mlResponse.type || 'unknown',
      source: file ? file.originalname : url,
      s3Path: mlResponse.s3_path || null,
    };
    
    const content = await Content.create(contentData);

    // 3. Log this action
    await logActivity(req.user.id, 'add_content', content._id);

    res.status(201).json({
      success: true,
      data: content,
      mlServiceResponse: mlResponse
    });
  } catch (error) {
    console.error('Content upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during content upload' });
  }
};


/**
 * @desc    Get all content created by the logged-in user.
 * @route   GET /api/content
 * @access  Private
 */
exports.getAllContent = async (req, res) => {
    try {
        const content = await Content.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: content.length, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching content' });
    }
};

/**
 * @desc    Update a specific piece of content.
 * @route   PUT /api/content/:id
 * @access  Private
 */
exports.updateContent = async (req, res) => {
    try {
        let content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        
        // Ensure the user owns the content
        if (content.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to edit this content' });
        }
        
        // Update the content with the request body
        content = await Content.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        
        await logActivity(req.user.id, 'edit_content', content._id);

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during content update' });
    }
};

/**
 * @desc    Delete a specific piece of content.
 * @route   DELETE /api/content/:id
 * @access  Private
 */
exports.deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        // Ensure the user owns the content
        if (content.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this content' });
        }

        await content.deleteOne();

        await logActivity(req.user.id, 'delete_content', req.params.id);

        res.status(200).json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during content deletion' });
    }
};


// ## --------------------
// ## SHARING
// ## --------------------

/**
 * @desc    Get all content that has been shared with the logged-in user.
 * @route   GET /api/content/shared
 * @access  Private
 */
exports.getSharedContent = async (req, res) => {
    try {
        const content = await Content.find({ sharedWith: req.user.id })
            .populate('user', 'name email') // Show who shared the content
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: content.length, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching shared content' });
    }
};


/**
 * @desc    Share a piece of content with another user via email.
 * @route   POST /api/content/:id/share
 * @access  Private
 */
exports.shareContent = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email to share with' });
        }

        const userToShareWith = await User.findOne({ email });
        if (!userToShareWith) {
            return res.status(404).json({ success: false, message: 'User with that email not found' });
        }
        if (userToShareWith.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot share content with yourself' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        // Ensure the user owns the content
        if (content.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to share this content' });
        }
        
        // Check if already shared
        if (content.sharedWith.includes(userToShareWith.id)) {
            return res.status(400).json({ success: false, message: 'Content already shared with this user' });
        }
        
        // Add user to the sharedWith array and save
        content.sharedWith.push(userToShareWith.id);
        await content.save();

        await logActivity(req.user.id, 'share_content', content._id);

        res.status(200).json({ success: true, message: `Content shared with ${email}`, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during content sharing' });
    }
};
