namespace Models
{

    public class FudbalStatistika : Statistika
    {
        public int GoloviDomacin { get; set; }
        public int GoloviGost { get; set; }
       
        public int SutDomacin { get; set; }
            public int SutGost { get; set; }
        public int SutKaGolDomacin { get; set; }
        public int SutKaGolGost { get; set; }

        public int ZutiKartoniDomacin { get; set; }
        public int ZutiKartoniGost { get; set; }

        public int CrveniKartoniDomacin { get; set; }
        public int CrveniKartoniGost { get; set; }
        public int PosedDomacin { get; set; }
        public int PosedGost { get; set; }
        public int PreciznostPasovaDomacin { get; set; }
        public int PreciznostPasovaGost { get; set; }
        

        public FudbalStatistika()
        {
            Sport = Strukture.SportType.Fudbal;
        }
    }
}