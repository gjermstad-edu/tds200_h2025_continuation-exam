import { uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getStorageRef } from 'root/firebaseConfig';

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
/
/ Koden er oppdatert ved hjelp av ChatGPT å lage et sikrere filnavn for bildet: Del 2) linje 22-27
*/

export const uploadImageToFirebase = async (uri: string) => {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('🚨 Brukeren er ikke logget inn');

  // 1) Leser av filen som en blol
  const fetchResponse = await fetch(uri);
  const blob = await fetchResponse.blob();

  // 2) Setter sammen unikt filnavn til bildet
  const lastSegment = uri.split('/').pop() ?? 'image';
  const [baseName, rawExt] = lastSegment.split('.');
  const ext = (rawExt || 'jpg').toLowerCase();
  const uniqueId = Date.now().toString(36);
  const safeBase = baseName.replace(/[^\w-]+/g, '_'); // fjern rare tegn
  const fileName = `${safeBase}_${uniqueId}.${ext}`;

  // 3) Lag en path til brukeren mappe i databasen
  const uploadPath = `images/${uid}/${fileName}`;
  const imageRef = getStorageRef(uploadPath);

  // 4) Fikser metadata
  const metadata = {
    // fallback hvis blob.type mangler
    contentType: blob.type || `image/${ext}`,
  };

  try {
    // 5) Laster opp bildet til databasen og henter ut URL
    await uploadBytes(imageRef, blob, metadata);
    console.log(`🛜 Uploading user image to path: ${uploadPath} [from imageApi.ts]`);

    const downloadURL = await getDownloadURL(imageRef);
    console.log(`🛜 Download URL: ${downloadURL} [from imageApi.ts]`);

    return downloadURL;
  } catch (e) {
    console.error(`🚨 Error: Coult not upload image: ${e} [from imageApi.ts]`);
    return 'ERROR';
  }
};
