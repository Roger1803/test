import React, { useState } from "react";

export default function SVGtoGraphMLConverter() {
  const [graphml, setGraphml] = useState("");
  const [filename, setFilename] = useState("output.graphml");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilename(file.name.replace(/\.svg$/, ".graphml"));
    const text = await file.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, "image/svg+xml");

    const rects = Array.from(svgDoc.querySelectorAll("rect"));
    const texts = Array.from(svgDoc.querySelectorAll("text"));
    const lines = Array.from(svgDoc.querySelectorAll("line"));

    const nodes = rects.map((rect, i) => {
      const id = `n${i}`;
      const x = rect.getAttribute("x") || 0;
      const y = rect.getAttribute("y") || 0;
      const label = texts[i]?.textContent?.trim() || `Node ${i + 1}`;
      return { id, x, y, label };
    });

    const edges = lines.map((line, i) => {
      const sourceIndex = i;
      const targetIndex = i + 1 < nodes.length ? i + 1 : 0;
      return {
        id: `e${i}`,
        source: nodes[sourceIndex]?.id,
        target: nodes[targetIndex]?.id,
      };
    });

    const graphmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph id="G" edgedefault="directed">
    ${nodes
      .map(
        (n) => `<node id="${n.id}"><data key="label">${n.label}</data></node>`
      )
      .join("\n")}
    ${edges
      .map(
        (e) =>
          `<edge id="${e.id}" source="${e.source}" target="${e.target}"/>`
      )
      .join("\n")}
  </graph>
</graphml>`;

    setGraphml(graphmlContent);
  };

  const handleDownload = () => {
    const blob = new Blob([graphml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <input type="file" accept=".svg" onChange={handleFileChange} />
      {graphml && (
        <button onClick={handleDownload} style={{ marginTop: "20px" }}>
          下载 GraphML 文件
        </button>
      )}
    </div>
  );
}
