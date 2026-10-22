# pdf_to_clean_images_cli.py
import os
from pdf2image import convert_from_path
from fpdf import FPDF

def convert_pdf_to_images(input_pdf, output_pdf="PDF_Lisible_Images.pdf"):
    temp_img = "page_temp.jpg"
    print("[*] Conversion des pages PDF en images...")
    try:
        images = convert_from_path(input_pdf)
    except Exception as e:
        print(f"[!] Erreur lors de la conversion : {e}")
        return

    pdf = FPDF()
    for i, img in enumerate(images):
        img.save(temp_img, "JPEG")
        pdf.add_page()
        pdf.image(temp_img, x=0, y=0, w=210, h=297)
        print(f"[+] Page {i+1} ajoutée")
        os.remove(temp_img)

    pdf.output(output_pdf)
    print(f"[✓] Nouveau PDF généré : {output_pdf}")

    try:
        os.remove(input_pdf)
        print(f"[-] Fichier original supprimé : {input_pdf}")
    except:
        print("[!] Impossible de supprimer le fichier source.")

    cache_dir = "/data/data/com.termux/files/usr/tmp" if "com.termux" in os.getcwd() else "/tmp"
    print(f"[~] Nettoyage du cache temporaire ({cache_dir})...")
    for f in os.listdir(cache_dir):
        fpath = os.path.join(cache_dir, f)
        try:
            if os.path.isfile(fpath) and "poppler" in f:
                os.remove(fpath)
        except:
            pass
    print("[✓] Nettoyage terminé.")

def menu():
    print("=== Convertisseur PDF vers PDF Lisible (Image) ===")
    input_pdf = input("Nom du fichier PDF à convertir (ex: monfichier.pdf) : ").strip()
    output_pdf = input("Nom du fichier PDF de sortie (laisser vide pour 'PDF_Lisible_Images.pdf') : ").strip()

    if not os.path.exists(input_pdf):
        print(f"[!] Le fichier {input_pdf} est introuvable.")
        return

    if not output_pdf:
        output_pdf = "PDF_Lisible_Images.pdf"

    convert_pdf_to_images(input_pdf, output_pdf)

if __name__ == "__main__":
    menu()
