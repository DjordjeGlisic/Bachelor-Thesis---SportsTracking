import React, { useEffect, useState, useContext } from "react";
import "./UcinakKluba.css";
import { Context, KluboviContext } from "../../Context/Context";
import axios from "axios";

export default function UcinakKluba() {
  // ✅ jedina pomocna (W/D/L) - racuna iz utakmica + rezultat "x:y"
  const wdl = (matches, club) => {
    let won = 0, drawn = 0, lost = 0;

    for (const m of matches) {
      // rezultat format "0:0"
      const parts = (m.rezultat || "").split(":");
      const h = Number(parts[0]);
      const a = Number(parts[1]);
      if (Number.isNaN(h) || Number.isNaN(a)) continue;

      const my = m.domacin === club ? h : a;
      const op = m.domacin === club ? a : h;

      if (my > op) won++;
      else if (my < op) lost++;
      else drawn++;
    }
    return { won, drawn, lost };
  };

  // ✅ jedina pomocna za datum (tvoj back ima "09.08.2025" kao string)
  const fmt = (dateStr) => {
    if (!dateStr) return "-";
    // ako je vec "dd.MM.yyyy" samo ga vrati
    return dateStr;
  };

  const { izabraniKlub,sport } = useContext(Context);
  const { klub } = useContext(KluboviContext);
  const aktivniKlub = izabraniKlub === null ? klub : izabraniKlub;

  const [takmicenja, setTakmicenja] = useState(null);
  const [takmicenje, setTakmicenje] = useState(null);

  // payload iz back-a: { utakmice: [], statistika: {} }
  const [data, setData] = useState(null);

  // strelice
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 6;

  // 1) ucitaj takmicenja kluba
  
  useEffect(() => {
    if (!aktivniKlub?.id) return;

    axios
      .get(`http://localhost:5146/Klub/VratiTakmicenjaKluba/${aktivniKlub.id}`)
      .then((resp) => {
        setTakmicenja(resp.data || []);
        // default: prvi turnir
        if (resp.data && resp.data.length > 0) {
          setTakmicenje(resp.data[0].id);
        }
      
      })
      .catch((err) => console.log(err));
  }, [aktivniKlub?.id]);

  // 2) kad izaberes turnir -> ucitaj utakmice+statistiku za (klub, takmicenje)
  useEffect(() => {
    if (!aktivniKlub?.id || !takmicenje) return;

    setStartIndex(0);

    axios
      // ⬇️ stavi ovde tvoj endpoint koji vraca objekat koji si poslao
      .get(`http://localhost:5146/Klub/VratiRezultateKlubaZaTakmicenje/${aktivniKlub.id}/${takmicenje}`)
      .then((resp) => {
        console.log("Statistika");
        console.log(resp.data.statistika);
        setData(resp.data);
      })
      .catch((err) => console.log(err));
  }, [aktivniKlub?.id, takmicenje]);

  // priprema utakmica (sort ASC po kolu ili datumu)
  const utakmice = (data?.utakmice || []).slice().sort((a, b) => {
    // najstabilnije: po broju kola (vec ga imas)
    const ak = a?.kolo?.brojKola ?? 0;
    const bk = b?.kolo?.brojKola ?? 0;
    return ak - bk;
  });

  const maxStart = Math.max(0, utakmice.length - visibleCount);
  const start = Math.min(Math.max(startIndex, 0), maxStart);
  const visible = utakmice.slice(start, start + visibleCount);

  // osnovne brojke
  const played = utakmice.length;
  const { won, drawn, lost } = wdl(utakmice, aktivniKlub?.naziv || "Arsenal");

  // donut (pobede/neresene/porazi) -> ako back salje pobede/neresene/porazi, uzmi to, inace racunaj iz meceva
  const s = data?.statistika || {};
  const w = typeof s.pobede === "number" ? s.pobede : won;
  const d = typeof s.neresene === "number" ? s.neresene : drawn;
  const l = typeof s.porazi === "number" ? s.porazi : lost;

  const total = Math.max(1, w + d + l);
  const wPct = (w / total) * 100;
  const dPct = (d / total) * 100;

  const donutStyle = {
    background: `conic-gradient(
      rgba(255, 140, 0, 0.95) 0% ${wPct}%,
      rgba(90, 200, 250, 0.95) ${wPct}% ${wPct + dPct}%,
      rgba(255, 80, 80, 0.95) ${wPct + dPct}% 100%
    )`,
  };

  // status meca
 
  const statusLabel = (m) => {
    if (m?.uzivo) return { text: "Uživo", cls: "live" };
  const now= new Date();
  const utakmica=new Date(m.datumPocetkaUtakmice);
    if (utakmica<now) return { text: "Odigrano", cls: "ft" };
    return { text: "Predstoji", cls: "upcoming" };
  };
const [sezone,setSezone]=useState("2025/26");
const [tabela,setTabela]=useState(null);
const nizSezona=[
    "2025/26",
    "2024/25",
    "2023/24",
    "2022/23",
    "2021/22",
    
    
    
    
];
 function formatDateTime(ts) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(ts));
}
useEffect(()=>{
  console.log("Sezona"+sezone);
  console.log("Klib");
  console.log(aktivniKlub);
  console.log("Takmicenje");
  console.log(takmicenje);
  
  // if(sezone==null||takmicenje==null||aktivniKlub==null)
  //   return;
    let sez=encodeURIComponent(sezone);
    
    
    axios.get(`http://localhost:5146/Klub/VratiTabeluKlubaZaTakmicenje/${takmicenje}/${sez}/${aktivniKlub.id}`)
    .then((resp)=>{setTabela(resp.data); console.log(resp.data);})
    .catch((err)=>{console.log(err)});
},[sezone,takmicenje,aktivniKlub?.id])
  return (
    <div className="kmks-wrap">
      <div className="kmks-scroll">
        {/* Matches */}
        <div className="kmks-card">
          <div className="kmks-top">
            <div>
              <div className="kmks-title">Mečevi</div>
              <div className="kmks-sub">Izaberi takmičenje i listaj mečeve</div>
            </div>

            <div className="kmks-selectWrap">
              <div className="kmks-selectLabel">Takmičenje</div>
              <select
                className="kmks-select"
                value={takmicenje || ""}
                onChange={(e) => setTakmicenje(Number(e.target.value))}
                disabled={!takmicenja || takmicenja.length === 0}
              >
                {(takmicenja || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.naziv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!data ? (
            <div className="kmks-loading">Učitavam mečeve...</div>
          ) : utakmice.length === 0 ? (
            <div className="kmks-loading">Nema mečeva za izabrano takmičenje.</div>
          ) : (
            <div className="kmks-matchesBar">
              <button
                type="button"
                className="kmks-arrow"
                onClick={() => setStartIndex((s) => Math.max(0, s - 1))}
                disabled={start <= 0}
                aria-label="Prev"
              >
                ‹
              </button>

              <div className="kmks-track" >
                {visible.map((m) => {
                  
                  console.log(m);
                  const st = statusLabel(m);
                  const isMeHome = m.domacin === aktivniKlub?.naziv;
                  const isMeAway = m.gost === aktivniKlub?.naziv;

                  return (
                    <div className="kmks-matchCard" key={m.id} onClick={()=>{console.log(m);}}>
                      <div className="kmks-matchMeta">
                        <span className={`kmks-status ${st.cls}`}>{st.text}</span>
                        <span className="kmks-date">{formatDateTime(m.datumPocetkaUtakmice)}</span>
                      </div>

                      <div className="kmks-teamRow">
                        <span className={`kmks-team ${isMeHome ? "isMe" : ""}`}>{m.domacin}</span>
                        <span className="kmks-result">{m.rezultat || "—"}</span>
                      </div>

                      <div className="kmks-teamRow">
                        <span className={`kmks-team ${isMeAway ? "isMe" : ""}`}>{m.gost}</span>
                        <span className="kmks-ghost" />
                      </div>

                      <div className="kmks-mini2">{m.lokacija}</div>
                      <div className="kmks-mini2">
                        Kolo: {m?.kolo?.brojKola ?? "-"} • Sezona: {m?.kolo?.sezona ?? "-"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="kmks-arrow"
                onClick={() => setStartIndex((s) => Math.min(maxStart, s + 1))}
                disabled={start >= maxStart}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Key stats */}
        <div className="kmks-card">
          <div className="kmks-top">
            <div>
              <div className="kmks-title">Ključne stavke</div>
              <div className="kmks-sub">
                {takmicenja?.find((x) => x.id === takmicenje)?.naziv || "—"}
              </div>
            </div>
          </div>

          {!data ? (
            <div className="kmks-loading">Učitavam statistiku...</div>
          ) : (
            <div className="kmks-statsGrid">
              {/* Left block (donut) */}
              <div className="kmks-leftStats">
                <div className="kmks-donut" style={donutStyle}>
                  <div className="kmks-donutInner">
                    <div className="kmks-donutNum">{data.statistika.odigrane}</div>
                    <div className="kmks-donutLab">Odigrane utakmice</div>
                  </div>
                </div>

                <div className="kmks-legend">
                  <div className="kmks-legRow">
                    <span className="kmks-dot dot-w" />
                    <span className="kmks-legText">{w} • Won</span>
                  </div>
                 {sport==1&&( <div className="kmks-legRow">
                    <span className="kmks-dot dot-d" />
                    <span className="kmks-legText">{d} • Drawn</span>
                  </div>)}
                  <div className="kmks-legRow">
                    <span className="kmks-dot dot-l" />
                    <span className="kmks-legText">{l} • Lost</span>
                  </div>
                </div>

                
              </div>

              {/* Right metrics (zavisi od sporta -> prikazuj sta postoji) */}
              <div className="kmks-rightStats">
                {"prosecnoSuteva" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoSuteva}</div>
                    <div className="kmks-lab">Prosečno šuteva</div>
                  </div>
                )}

                {"prosecnoOkvir" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoOkvir}</div>
                    <div className="kmks-lab">Prosečno šuteva u okvir gola</div>
                  </div>
                )}

                {"prosecnoGolova" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoGolova}</div>
                    <div className="kmks-lab">Prosečno golova</div>
                  </div>
                )}

                {"prosecnoPosed" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoPosed}%</div>
                    <div className="kmks-lab">Prosečan posed </div>
                  </div>
                )}

                {"prosecnoPreciznost" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoPreciznost}%</div>
                    <div className="kmks-lab">Prosečna preciznost </div>
                  </div>
                )}

                {"prosecnoZuti" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">
                      <span className="kmks-cardIcon yellow" /> {s.prosecnoZuti}
                    </div>
                    <div className="kmks-lab">Žuti kartoni u proseku</div>
                  </div>
                )}

                {"prosecnoCrveni" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">
                      <span className="kmks-cardIcon red" /> {s.prosecnoCrveni}
                    </div>
                    <div className="kmks-lab">Crveni kartoni u proseku</div>
                  </div>
                )}

                 {"prosecnoPoena" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoPoena.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno poena po meču</div>
                  </div>
                )}
                 {"prosecnoPrva" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoPrva.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno poena u prvoj četvrtini</div>
                  </div>
                )}
                 {"prosecnoDruga" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoDruga.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno poena u drugoj četvrtini</div>
                  </div>
                )}
                 {"prosecnoTreca" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoTreca.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno poena u trećoj četvrtini</div>
                  </div>
                )}
                  {"prosecnoCetvrta" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoCetvrta.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno poena u četvrtoj četvrtini</div>
                  </div>
                )}
                {"prosecnoSkokova" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoSkokova.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno skokova</div>
                  </div>
                )}

                {"prosecnoAsistencija" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoAsistencija.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno asistencije</div>
                  </div>
                )}
                 {"prosecnoBlokada" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoBlokada.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno blokada</div>
                  </div>
                )}
                  {"prosecnoUkradenih" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoUkradenih.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno ukradenih lopti</div>
                  </div>
                )}
                   {"prosecnoFT" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoFT.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno ubačenih slobodnih bacanja </div>
                  </div>
                )}
                 {"prosecnoTwo" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoTwo.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno ubačenih dvojki</div>
                  </div>
                )}
                  {"prosecnoThree" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoThree.toFixed(2)}</div>
                    <div className="kmks-lab">Prosečno ubačenih trojki</div>
                  </div>
                )}

                {"prosecnoIskljucenja" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoIskljucenja.toFixed(2)}</div>
                    <div className="kmks-lab">Isključenja po meču</div>
                  </div>
                )}
                

                {"prosecnoPetersaca" in s && (
                  <div className="kmks-metric">
                    <div className="kmks-val">{s.prosecnoPeteraca.toFixed(2)}</div>
                    <div className="kmks-lab">Peteraca po meču</div>
                  </div>
                )}

                {/* fallback ako nema nijedno polje osim W/D/L */}
                {!(
                  "prosecnoSuteva" in s ||
                  "prosecnoOkvir" in s ||
                  "prosecnoGolova" in s ||
                  "prosecnoPosed" in s ||
                  "prosecnoPreciznost" in s ||
                  "prosecnoZuti" in s ||
                  "prosecnoCrveni" in s ||
                  "prosecnoSkokova" in s ||
                  "prosecnoAsist" in s ||
                  "prosecnoIskljucenja" in s ||
                  "prosecnoPetersaca" in s
                ) && (
                  <div className="kmks-metric kmks-metric--wide">
                    <div className="kmks-lab">Nema dodatnih metrika za ovaj sport / takmičenje.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        <div className="kmks-top">
            <div>
              <div className="kmks-title">Učinak u ptethodnih 5 sezona</div>
              <div className="kmks-sub">Izaberi takmičenje i sezonu i vidi poziciju kluba u tabeli</div>
            </div>

            <div className="kmks-selectWrap">
              <div className="kmks-selectLabel">Takmičenje i sezona</div>
              <select
                className="kmks-select"
                value={takmicenje || ""}
                onChange={(e) => setTakmicenje(Number(e.target.value))}
                disabled={!takmicenja || takmicenja.length === 0}
              >
                {(takmicenja || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.naziv}
                  </option>
                ))}
              </select>
               <select
                className="kmks-select"
                value={sezone}
                onChange={(e) => setSezone(e.target.value)}
              >
                {nizSezona.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
           
            </div>
          </div>
          <div className="kmks-card">
            <div className="tabela-card">
                    {(tabela!==null&&(sport===1||sport===3))&&(
                  <div className="tabela-header-row">
                    <div className="col-pos">#</div>
                    <div className="col-club">Klub</div>
                    <div className="col-num">OU</div>
                    <div className="col-num">P</div>
                    <div className="col-num">N</div>
                    <div className="col-num">I</div>
                    <div className="col-num">DG</div>
                    <div className="col-num">PG</div>
                    <div className="col-num">GR</div>
                    <div className="col-num">Bod</div>
                    
                  </div>)}
              {(tabela!==null&&(sport===2))&&(
                  <div className="tabela-header-row">
                    <div className="col-pos">#</div>
                    <div className="col-club">Klub</div>
                    <div className="col-num">OU</div>
                    <div className="col-num">P</div>
                    
                    <div className="col-num">I</div>
                    <div className="col-num">PTS+</div>
                    <div className="col-num">PTS-</div>
                    <div className="col-num">DIFF</div>
                    <div className="col-num">Bod</div>
                    
                  </div>)}
              
                  
            
            {tabela!==null&&(
                  <div className="tabela-body">
                    {tabela.map((row,ind) => (
                      <div className="tabela-row" key={ind} style={{backgroundColor:row.klubId==aktivniKlub.id?' #292320ff;':'transparent'}}>
                        <div className="col-pos">{ind+1}</div>
                        <div className="col-club">
                          <div className="club-logo-circle">
                            <img src={row.logo}/>
                          </div>
                          <span className="club-name">{row.klub}</span>
                        </div>
                        <div className="col-num">{row.odigrane}</div>
                        <div className="col-num">{row.pobeda}</div>
                        {sport!==2&&(<div className="col-num">{row.neresene}</div>)}
                        <div className="col-num">{row.porazi}</div>
                        <div className="col-num">{row.datiPoeni}</div>
                        <div className="col-num">{row.primljeniPoeni}</div>
                        <div className="col-num">{row.razlika}</div>
                        <div className="col-num col-pts">{row.bodovi}</div>
                  
                      </div>
                    ))}
                  </div>)}
                
                </div>

          </div>
    </div>
  );
}
