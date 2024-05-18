function calculateCosineSimilarity(output1, output2) {
  function dotProduct(arr1, arr2) {
    let dot = 0;
    for (let i = 0; i < arr1.length; i++) {
      dot += arr1[i] * arr2[i];
    }
    return dot;
  }

  function magnitude(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i] * arr[i];
    }
    return Math.sqrt(sum);
  }

  function cosineSimilarity(arr1, arr2) {
    const dot = dotProduct(arr1, arr2);
    const mag1 = magnitude(arr1);
    const mag2 = magnitude(arr2);
    return dot / (mag1 * mag2);
  }
  return cosineSimilarity(output1, output2);
}

module.exports = {
  calculateCosineSimilarity: calculateCosineSimilarity,
};
