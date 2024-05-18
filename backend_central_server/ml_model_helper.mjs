import { pipeline, Tensor, cos_sim } from "@xenova/transformers";

async function get_sentence_vector(sentence) {
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  return await extractor(sentence, {
    pooling: "mean",
    normalize: true,
  });
}

function convertToTensor(obj) {
  const dataArray = Object.values(obj.data);
  const float32Array = new Float32Array(dataArray);
  return new Tensor(obj.type, float32Array, obj.dims);
}

function sim(a, b) {
  return cos_sim(a, b);
}
export { get_sentence_vector, convertToTensor, sim };
