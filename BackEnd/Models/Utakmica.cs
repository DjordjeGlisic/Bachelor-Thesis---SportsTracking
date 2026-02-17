using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("Utakmica")]
    public class Utakmica
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public bool Uzivo { get; set; } 
        [Required]
        
        public string Domacin { get; set; }
        [Required]
        public string Gost { get; set; }
        [Required]
        public string Lokacija { get; set; }
        [Required]
        public DateTime DatumPocetkaUtakmice { get; set; }
        
        [Required]
        public string Rezultat { get; set; }
      
        
        //VEZE
          public Kolo Kolo { get; set; }
        [Required]
        public int KoloId { get; set; }
        public Statistika Statistika { get; set; }
        [Required]
        public int StatistikaId { get; set; }


    }
}