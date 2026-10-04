import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

// brightness of a colour, used for the readability warning
function brightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export default function App() {
  const [type, setType] = useState("url");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [size, setSize] = useState(256);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState("M");
  const [margin, setMargin] = useState(true);
  const boxRef = useRef(null);

  // Build the QR data and check the input
  let data = "";
  let error = "";

  if (type === "url") {
    try {
      new URL(text);
      data = text;
    } catch {
      error = "Enter a valid URL (e.g. https://google.com)";
    }
  } else if (type === "text") {
    if (!text.trim()) error = "Enter some text";
    else data = text;
  } else if (type === "email") {
    if (!/^\S+@\S+\.\S+$/.test(email)) error = "Enter a valid email";
    else data = `mailto:${email}`;
  } else if (type === "phone") {
    if (!/^\+?[0-9]{7,15}$/.test(phone)) error = "Enter a valid phone number (7-15 digits)";
    else data = `tel:${phone}`;
  } else if (type === "wifi") {
    if (!ssid.trim()) error = "Enter the Wi-Fi name";
    else data = `WIFI:T:WPA;S:${ssid};P:${password};;`;
  }

  // Scan reliability warnings
  const warnings = [];
  if (Math.abs(brightness(fg) - brightness(bg)) < 125)
    warnings.push("Low contrast between colours. The QR may not scan.");
  if (brightness(fg) > brightness(bg))
    warnings.push("Foreground is lighter than background. Some scanners can't read this.");
  if (!margin) warnings.push("No margin. Some scanners need a blank border.");
  if (size < 128) warnings.push("Small size may be hard to scan.");

  function download() {
    const canvas = boxRef.current.querySelector("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qrcode.png";
    link.click();
  }

  const box = { display: "block", margin: "8px 0", padding: 8, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 480, margin: "20px auto", padding: 16, fontFamily: "sans-serif", background: "#eef2ff", borderRadius: 12, color:"#111" }}>
      <h1>Pranetha's QR Studio</h1>

      <label>Type</label>
      <select style={box} value={type} onChange={(e) => setType(e.target.value)}>
        <option value="url">URL</option>
        <option value="text">Plain Text</option>
        <option value="email">Email</option>
        <option value="phone">Phone Number</option>
        <option value="wifi">Wi-Fi</option>
      </select>

      {(type === "url" || type === "text") && (
        <input style={box} placeholder={type === "url" ? "https://example.com" : "Your text"}
          value={text} onChange={(e) => setText(e.target.value)} />
      )}
      {type === "email" && (
        <input style={box} placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      )}
      {type === "phone" && (
        <input style={box} placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
      )}
      {type === "wifi" && (
        <>
          <input style={box} placeholder="Wi-Fi name" value={ssid} onChange={(e) => setSsid(e.target.value)} />
          <input style={box} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Customize</h3>
      <label>Size: {size}px</label>
      <input type="range" min="64" max="400" value={size} onChange={(e) => setSize(Number(e.target.value))} style={box} />

      <label>Foreground </label>
      <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
      <label> Background </label>
      <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />

      <label style={{ display: "block", marginTop: 8 }}>Error correction</label>
      <select style={box} value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="L">Low</option>
        <option value="M">Medium</option>
        <option value="Q">Quartile</option>
        <option value="H">High</option>
      </select>

      <label>
        <input type="checkbox" checked={margin} onChange={(e) => setMargin(e.target.checked)} /> Margin
      </label>

      {warnings.map((w) => (
        <p key={w} style={{ color: "darkorange" }}>⚠ {w}</p>
      ))}

      <div ref={boxRef} style={{ marginTop: 16, textAlign: "center" }}>
        {data ? (
          <QRCodeCanvas value={data} size={size} fgColor={fg} bgColor={bg} level={level} marginSize={margin ? 4 : 0} />
        ) : (
          <p>Fill in the details to see your QR code.</p>
        )}
      </div>

      {data && (
        <button onClick={download} style={{ ...box, marginTop: 16, cursor: "pointer" }}>
          Download PNG
        </button>
      )}
    </div>
  );
}