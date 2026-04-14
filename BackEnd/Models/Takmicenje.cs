using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Strukture;

namespace Models
{
    [Table("Takmicenje")]
    public class Takmicenje
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public SportType Sport { get; set; }
        [Required]
        public string Naziv { get; set; }

        [Required]
        public string LogoURL { get; set; }
        [Required]
        [MaxLength(50)]
        public string Opis{get;set;}
        [Required]
        [MaxLength(50)]
        public string Drzava{get;set;}
        
        //VEZE
        public List<Ucinak> Ucinci { get; set; } = new List<Ucinak>();

        public List<Tabela> Klubovi { get; set; } = new List<Tabela>();
        
        public List<Kolo> Kolа { get; set; } = new List<Kolo>();
        
    }
}