// Tabela.jsx
import "./Tabela.css";
import { useContext, useRef } from "react";
import { Context, TakmicenjeContext } from "../../Context/Context";
import axios from "axios";
import KlubModal from "./Rezultati/Utakmica/KlubModal";

function formatNaziv(naziv) {
  return naziv
    .replace(/([a-z])([A-Z])/g, "$1 $2") // malo + veliko => razmak
    .replace(/^./, (s) => s.toUpperCase()); // prvo slovo veliko
}
const Tabela = (props) => {
    const { takmicenje } = useContext(TakmicenjeContext);
  
    
    const rawData = props.data ?? [];
    if (!rawData.length) return null;
    
    const firstRow = rawData[0];
    const kljucevi = Object.keys(firstRow);


  // 1 kolona za # + N kolona za atribute (sve dinamički)
  const colTemplate = `60px repeat(${kljucevi.length}, minmax(150px, auto))`;

  return (
    <>
   
    <div className="et-wrapper">
      <div className="et-header-bar">
        <span className="et-title">
          {takmicenje.naziv} — {props.naslov}
        </span>
      </div>

      <div className="et-scroll">
        <div className="et-table">
          {/* HEADER */}
          <div
            className="et-row et-row-head"
            style={{ gridTemplateColumns: colTemplate }}
          >
            <div className="et-col et-center">#</div>
            {kljucevi
            .filter(key => !key.includes("Id"))
            .map((key, i) => (
              <div className="et-col" key={i}>
                {formatNaziv(key)}
              </div>
            ))}
          </div>

          {/* BODY */}
          {rawData.map((row, i) => (
            <div
              className="et-row"
              key={i}
              style={{ gridTemplateColumns: colTemplate }}
              
            >
              <div className="et-col et-center">{i + 1}</div>

              {kljucevi
                .filter(key => !key.includes("Id"))
                .map((key, j) => (
                
                <div className="et-col " key={j}>
                  {key==="procenat" ? row[key].toFixed(2) : row[key]}
                </div>
                
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
    
    </>
  );
};

export default Tabela;
