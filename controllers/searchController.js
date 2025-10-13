const { queryModel } = require('../services/mlService');
const Content = require('../models/Content');

/**
 * @desc    Perform a search query using the ML service
 * @route   POST /api/search
 * @access  Private
 */
exports.performSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // 1. Get the AI-generated answer and sources from the ML service
    const mlResponse = await queryModel(query);

    // 2. (Optional but recommended) Enhance the sources with data from our DB
    const sourceIdentifiers = mlResponse.sources.map(s => s.source || s.filename);
    const ourContent = await Content.find({
        user: req.user.id,
        source: { $in: sourceIdentifiers }
    });

    const enrichedSources = mlResponse.sources.map(source => {
        const matchingContent = ourContent.find(c => c.source === (source.source || source.filename));
        return {
            ...source, // Original source info from ML service
            dbId: matchingContent ? matchingContent._id : null,
            title: matchingContent ? matchingContent.title : source.filename,
        };
    });

    res.status(200).json({
      success: true,
      data: {
        answer: mlResponse.answer,
        sources: enrichedSources,
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};