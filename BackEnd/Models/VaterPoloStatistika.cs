namespace Models
{

   
         public class VaterpoloStatistika : Statistika
    {
        public int VP_PrvaCetDomacin { get; set; }
        public int VP_PrvaCetGost { get; set; }

        public int VP_DrugaCetDomacin { get; set; }
            public int VP_DrugaCetGost { get; set; }
        public int VP_TrecaCetDomacin { get; set; }
        public int VP_TrecaCetGost { get; set; }

        public int VP_CetvCetDomacin { get; set; }
        public int VP_CetvCetGost { get; set; }

       public int IskljucenjaDomacin { get; set; }
    public int IskljucenjaGost { get; set; }

    public int PeterciDomacin { get; set; }
    public int PeterciGost { get; set; }

      
        public VaterpoloStatistika()
        {
            Sport = Strukture.SportType.Vaterpolo;
        }
    }
      
    
}