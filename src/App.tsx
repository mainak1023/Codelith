import React from "react";
import CodeEditor from "@/components/code-editor";

const App: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Online Code Editor</h1>
      <CodeEditor />
    </div>
  );
};

export default App;
