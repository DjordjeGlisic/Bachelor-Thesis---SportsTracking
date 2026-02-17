using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [Table("Korisnik")]
    public class Korisnik
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public string Ime { get; set; } 
        [Required]
        public string Prezime { get; set; }
        [Required]
        public string Username { get; set; } 
        [Required]
        public string Lozinka { get; set; }
        [Required]
        [MaxLength(10)]
        public int Telefon { get; set; }
        
    ///VEZE
        public List<Klub> PraceniKlubovi { get; set; } = new List<Klub>();

    }
}