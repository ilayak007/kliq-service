const formatFollowers = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };
  
  module.exports = { formatFollowers };
  