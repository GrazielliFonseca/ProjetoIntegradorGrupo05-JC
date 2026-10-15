import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { localProducts, resolveProductImage } from "./products";
import terminal from "../assets/terminal-hidraulico.png.asset.json";
import mangueira from "../assets/mangueira-tranca-aco.jpg.asset.json";

describe("product image URLs", () => {
  it("uses the asset pointer URL for all seven local products", () => {
    assert.equal(localProducts.length, 7);
    for (const product of localProducts) {
      assert.equal(product.image_url?.startsWith("/__l5e/assets-v1/"), true);
    }
  });

  it("normalizes a legacy terminal image returned by the database", () => {
    assert.equal(resolveProductImage("/imagens/terminal-hidraulico.png"), terminal.url);
  });

  it("maps both legacy hose extensions to the existing JPG asset", () => {
    assert.equal(resolveProductImage("/imagens/mangueira-tranca-aco.png"), mangueira.url);
    assert.equal(resolveProductImage("/imagens/mangueira-tranca-aco.jpg"), mangueira.url);
  });

  it("preserves custom admin image URLs and uploaded images", () => {
    const customUrl = "https://example.com/custom-product.png";
    const upload = "data:image/png;base64,aGVsbG8=";
    assert.equal(resolveProductImage(customUrl), customUrl);
    assert.equal(resolveProductImage(upload), upload);
    assert.equal(resolveProductImage(null), null);
  });
});