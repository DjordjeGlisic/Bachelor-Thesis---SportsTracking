namespace Models
{
public class KosarkaStatistika : Statistika
    {
    
     public int PrvaCetDomacin { get; set; }
        public int PrvaCetGost { get; set; }

        public int DrugaCetDomacin { get; set; }
        public int DrugaCetGost { get; set; }
        public int TrecaCetDomacin { get; set; }
        public int TrecaCetGost { get; set; }

        public int CetvCetDomacin { get; set; }
        public int CetvCetGost { get; set; }

     
        public int TwoPointDomacin { get; set; }
        public int TwoPointGost { get; set; }
        public int ThreePointDomacin { get; set; }
        public int ThreePointGost { get; set; }
         public int FreeThrowDomacin { get; set; }
        public int FreeThrowGost { get; set; }
       
         
         public int ReboundsDomacin { get; set; }

        public int ReboundsGost { get; set; }
        public int StealsDomacin { get; set; }
        public int StealsGost { get; set; }
        public int BlocksDomacin { get; set; }
        public int BlocksGost { get; set; }

        public KosarkaStatistika()
        {
            Sport = Strukture.SportType.Kosarka;
        }
}
}