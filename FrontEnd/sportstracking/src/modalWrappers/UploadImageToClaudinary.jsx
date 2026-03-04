export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Naziv koji si kreirao
  formData.append("cloud_name", "djucjpaup");    // Tvoj cloud name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/djucjpaup/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url; // Vraća javni HTTPS URL slike
    } else {
      console.error("Greška u odgovoru Cloudinary-ja:", data);
      return null;
    }
  } catch (error) {
    console.error("Greška pri uploadu na Cloudinary:", error);
    return null;
  }
};