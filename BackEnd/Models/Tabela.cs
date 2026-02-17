using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Strukture;

namespace Models
{
    [Table("Tabela")]
    public class Tabela
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public string NazivTabele{get;set;}
          [Required]
        public int Odigrane { get; set; }
        [Required]
        public int Pobede { get; set; }
        [Required]
        public int Izgubljene { get; set; }
        [Required]
        public int Neresene { get; set; }
        [Required]
        public int BrojDatihPoena { get; set; }
        [Required]
        public int BrojPrimljenihPoena { get; set; }
        [Required]
        public int Razlika { get; set; }
        [Required]
        public int BrojBodova { get; set; }
        [Required]
       public string Sezona{ get; set; }
        //VEZE
        public Takmicenje Takmicenje { get; set; }
        [Required]
        public int TakmicenjeId { get; set; }
        public Klub Klub { get; set; }
        [Required]
        public int KlubId { get; set; }
    }
}