import React, { useContext, useMemo } from "react";
import{ Context,KluboviContext } from "../../Context/Context";
import "./OpsteInfo.css";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const OpsteInfo = () => {
const { korisnik, izabraniKlub } = useContext(Context);
  const { klub } = useContext(KluboviContext);

  const aktivniKlub = izabraniKlub ? izabraniKlub : klub;

 

  // ---------- Helpers ----------
  const parseMoneyToNumber = (input) => {
    if (input == null) return 0;

    let s = String(input).trim().toLowerCase();
    s = s.replace(/\s/g, "").replace(/€/g, "").replace(/eur/g, "");
    s = s.replace(",", ".");

    let mult = 1;
    if (s.endsWith("b")) {
      mult = 1_000_000_000;
      s = s.slice(0, -1);
    } else if (s.endsWith("m")) {
      mult = 1_000_000;
      s = s.slice(0, -1);
    } else if (s.endsWith("k")) {
      mult = 1_000;
      s = s.slice(0, -1);
    }

    s = s.replace(/[^0-9.]/g, "");
    const n = Number(s);
    if (!Number.isFinite(n)) return 0;

    return Math.round(n * mult);
  };

  const parseCsvList = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    return String(input)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  };

  // Trofeji: validan format mora biti "... (jedan+ razmak) xBROJ"
  // npr "Serie A x19", "UCL   x7"
  const extractTrophies = (input) => {
  if (input == null) return [];

  // 1) Pretvori bilo šta u string (array -> join)
  const raw = Array.isArray(input) ? input.join(",") : String(input);

  // DEBUG (privremeno): videćeš tačno šta je string
  console.log("TROFEJI RAW:", raw);
  console.log("TROFEJI RAW JSON:", JSON.stringify(raw));
  console.log(
    "TROFEJI CODES:",
    [...raw].map(ch => `${ch}(${ch.charCodeAt(0)})`).slice(0, 120).join(" ")
  );

  // 2) Normalizuj whitespace i razne varijante "x"
  // - NBSP -> space
  // - više razmaka -> jedan
  // - ćirilično х (U+0445) -> latin x
  // - znak × (U+00D7) -> x
  let s = raw
    .replace(/\u00A0/g, " ")
    .replace(/\u0445/g, "x")   // ćirilično "х"
    .replace(/\u00D7/g, "x")   // znak "×"
    .replace(/\s+/g, " ")
    .trim();

  // 3) Split po zarezu
  const parts = s.split(",").map(p => p.trim()).filter(Boolean);

  const valid = [];
  for (let part of parts) {
    // Regex: takmičenje + (razmak opciono) + x + (razmak opciono) + broj
    const m = part.match(/^(.*?)\s*[xX]\s*(\d+)\s*$/);
    if (m) {
      valid.push({ takmicenje: m[1].trim(), broj: parseInt(m[2], 10) });
    }
  }

  return valid;
};


  const formatMoney = (n) =>
    new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(n);

  // ---------- Data ----------
  const prihodiN = parseMoneyToNumber(aktivniKlub?.prihodi);
  const rashodiN = parseMoneyToNumber(aktivniKlub?.rashodi);

  const sponzoriArr = parseCsvList(aktivniKlub?.sponzori);

  const trofejiValid = extractTrophies(aktivniKlub?.trofeiji);
  const hasTrophies = trofejiValid.length > 0;
console.log("OpsteInfo aktivniKlub.trofeji =", aktivniKlub?.trofeiji);
console.log("OpsteInfo aktivniKlub.trofeji JSON =", JSON.stringify(aktivniKlub?.trofeiji));

  // ---------- Pie ----------
  const pie = useMemo(() => {
    const inc = Math.max(0, prihodiN || 0);
    const exp = Math.max(0, rashodiN || 0);
    const total = inc + exp || 1;

    const pInc = Math.round((inc / total) * 1000) / 10;
    const pExp = Math.round((exp / total) * 1000) / 10;
    const degInc = (pInc / 100) * 360;

    return { inc, exp, total, pInc, pExp, degInc };
  }, [prihodiN, rashodiN]);

  // Ako aktivniKlub još nije spreman (prvi render)
  if (!aktivniKlub) return null;

  return (
    <div className="fs-wrap">
      {/* ROW 1: Finansije + Sponzori + Kontakt */}
      <div className="fs-grid3">
        {/* Finansije */}
        <div className="fs-card">
          <div className="fs-cardTop">
            <div className="fs-title">Finansije</div>
            <div className="fs-sub">Prihodi vs rashodi</div>
          </div>

          <div className="fs-finBody">
            <div
              className="fs-pie"
              style={{
                background: `conic-gradient(
                  var(--fs-green) 0deg ${pie.degInc}deg,
                  var(--fs-red) ${pie.degInc}deg 360deg
                )`,
              }}
              aria-label="Pie chart prihodi i rashodi"
            >
              <div className="fs-pieHole" />
            </div>

            <div className="fs-legend">
              <div className="fs-legRow">
                <span className="fs-dot fs-dotGreen" />
                <div className="fs-legText">
                  <div className="fs-legLabel">Prihodi</div>
                  <div className="fs-legVal">
                    {aktivniKlub?.prihodi ?? formatMoney(pie.inc)}{" "}
                    <span className="fs-legPct">({pie.pInc}%)</span>
                  </div>
                </div>
              </div>

              <div className="fs-legRow">
                <span className="fs-dot fs-dotRed" />
                <div className="fs-legText">
                  <div className="fs-legLabel">Rashodi</div>
                  <div className="fs-legVal">
                    {aktivniKlub?.rashodi ?? formatMoney(pie.exp)}{" "}
                    <span className="fs-legPct">({pie.pExp}%)</span>
                  </div>
                </div>
              </div>

              <div className="fs-total">
                Ukupno: <b>{formatMoney(pie.total)}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Sponzori */}
        <div className="fs-card">
          <div className="fs-cardTop">
            <div className="fs-title">Sponzori</div>
            <div className="fs-sub">Partneri kluba</div>
          </div>

          <div className="fs-list">
            {sponzoriArr.length ? (
              sponzoriArr.map((s, i) => (
                <div className="fs-listItem" key={i}>
                  <span className="fs-bullet" />
                  <span className="fs-itemText">{s}</span>
                </div>
              ))
            ) : (
              <div className="fs-listItem">
                <span className="fs-bullet" />
                <span className="fs-itemText">Nema sponzora</span>
              </div>
            )}
          </div>
        </div>

        {/* Kontakt informacije */}
        <div className="fs-card">
          <div className="fs-cardTop">
            <div className="fs-title">Kontakt informacije</div>
            <div className="fs-sub">Email i adresa</div>
          </div>

          <div className="fs-contact">
            <div className="fs-contactRow">
              <div className="fs-contactIcon">
                <EmailIcon fontSize="small" />
              </div>
              <div className="fs-contactText">
                <div className="fs-contactLabel">Email</div>
                <div className="fs-contactValue">{aktivniKlub?.email ?? "-"}</div>
              </div>
            </div>

            <div className="fs-contactRow">
              <div className="fs-contactIcon">
                <LocationOnIcon fontSize="small" />
              </div>
              <div className="fs-contactText">
                <div className="fs-contactLabel">Adresa</div>
                <div className="fs-contactValue">{aktivniKlub?.adresa ?? "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Kratka istorija + ugnježdena Trofeji */}
      <div className="fs-card fs-cardWide">
        <div className="fs-cardTop">
          <div className="fs-title">Kratka istorija</div>
          <div className="fs-sub">Pregled kroz godine</div>
        </div>

        <div className="fs-historyLayout">
          {/* Skrol samo za tekst */}
          <div className="fs-historyScroll">
            <p className="fs-par">{aktivniKlub?.istorija ?? ""}</p>
          </div>

          {/* Trofeji */}
          <div className="fs-nestedCard">
            <div className="fs-nestedTop">
              <div className="fs-nestedTitle">Trofeji</div>
              <div className="fs-nestedSub">Najvažniji uspesi</div>
            </div>

            <div className="fs-trophList">
              {hasTrophies ? (
                trofejiValid.map((t, idx) => (
                  <div className="fs-trophRow" key={idx}>
                    <span className="fs-trophName">{t.takmicenje}</span>
                    <span className="fs-trophCount">x{t.broj}</span>
                  </div>
                ))
              ) : (
                <div className="fs-trophRow">
                  <span className="fs-trophName">Nema trofeja</span>
                  <span className="fs-trophCount">—</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpsteInfo;
