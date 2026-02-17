using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Strukture;

namespace Models
{
    [Table("Klub")]
    public class Klub
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public string Naziv { get; set; } 
      [Required]
        public SportType Sport { get; set; } 
      
        [Required]
        public string Trofeji { get; set; } 
        [Required]
        public string Sponzori { get; set; }
        [Required]
        public string Adresa { get; set; }
        [Required]
        public string Prihodi { get; set; }
        [Required]
        public string Rashodi { get; set; }
        [Required]
        public string LogoURL { get; set; }
        [Required]
        public string Istorija { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }    
        
        //VEZE
        public List<Korisnik> Pratioci { get; set; } = new List<Korisnik>();    
        public List<Novosti> Novosti { get; set; } = new List<Novosti>();
        public List<Igrac> Igraci { get; set; } = new List<Igrac>();
        public List<Tabela> Takmicenja { get; set; } = new List<Tabela>();
       
    }
}