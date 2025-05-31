const categorizeIssue = (description, urgentVotes, notUrgentVotes) => {
  const desc = description.toLowerCase();
  
  // Define keyword mappings for categories
  const categories = {
    Infrastructure: ['road', 'bridge', 'electricity', 'power', 'streetlight', 'building'],
    WaterSupply: ['water', 'pipe', 'leak', 'supply', 'drinking', 'tap'],
    Health: ['health', 'medical', 'hospital', 'clinic', 'disease', 'sanitation'],
    Education: ['school', 'education', 'teacher', 'library', 'classroom'],
    Environment: ['pollution', 'waste', 'garbage', 'clean', 'forest', 'tree'],
  };

  // Find the category based on keywords
  let category = 'General';
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      category = cat;
      break;
    }
  }

  // Suggest priority based on votes
  const totalVotes = (urgentVotes || 0) + (notUrgentVotes || 0);
  let suggestedPriority = 'Low';
  if (totalVotes > 5 || (urgentVotes || 0) > 3) {
    suggestedPriority = 'High';
  } else if (totalVotes > 2) {
    suggestedPriority = 'Medium';
  }

  // Suggest actions based on category
  const suggestions = {
    Infrastructure: 'Schedule a site inspection and allocate funds for repair.',
    WaterSupply: 'Contact the water department and arrange for immediate inspection.',
    Health: 'Coordinate with the nearest health center for support.',
    Education: 'Engage with the school administration to address the issue.',
    Environment: 'Organize a community cleanup drive and involve local authorities.',
    General: 'Discuss the issue in the next Gram Sabha meeting for resolution.',
  };

  return {
    category,
    suggestedPriority,
    suggestion: suggestions[category],
  };
};

export { categorizeIssue };