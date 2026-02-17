using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("Igrac")]
    public class Igrac
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public string Ime { get; set; } 
        [Required]
        public string Prezime { get; set; }
        [Required]
        public DateOnly DatumPocetkaUgovora { get; set; }
        [Required]
        public DateOnly DatumKrajaUgovora { get; set; }
        [Required]
        public string Pozicija { get; set; }
        [Required]
        public float Visina { get; set; }
        [Required]
        public float Tezina { get; set; }
        [Required]
        public DateOnly DatumRodjenja { get; set; }
       [Required]
       public string ListaKlubova{get;set;}
       
        [Required]
        public int BrojGodina { get; set; }
       
       //VEZE
        public List<Ucinak> Ucinci { get; set; } = new List<Ucinak>();
        public Klub Klub { get; set; }
        [Required]
        public int KlubID { get; set; } 

    }
}