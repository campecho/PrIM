import React, { useState, useRef, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useFirestoreSync<T>(
  collectionName: string,
  docId: string,
  fallback: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const serverValueStr = React.useRef<string>(JSON.stringify(fallback));

  useEffect(() => {
    let active = true;
    const docRef = doc(db, collectionName, docId);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (docSnap) => {
        if (!active) return;
        if (docSnap.exists()) {
          const incomingData = docSnap.data().data;
          console.log(
            `[useFirestoreSync] ${collectionName}/${docId} Snapshot received. Data length:`,
            Array.isArray(incomingData) ? incomingData.length : "object",
          );
          serverValueStr.current = JSON.stringify(incomingData);
          setValue((prev) =>
            JSON.stringify(prev) === serverValueStr.current
              ? prev
              : incomingData,
          );
        } else {
          console.log(
            `[useFirestoreSync] ${collectionName}/${docId} Document does not exist. Using fallback.`,
          );
          // Document does not exist in backend, hold fallback
          serverValueStr.current = JSON.stringify(fallback);
          setValue((prev) =>
            JSON.stringify(prev) === serverValueStr.current ? prev : fallback,
          );
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error(
          `[useFirestoreSync] ${collectionName}/${docId} Sync error:`,
          err,
        );
        if (active) setIsLoaded(true);
      },
    );

    return () => {
      active = false;
      unsubscribeSnapshot();
    };
  }, [collectionName, docId]);

  useEffect(() => {
    if (!isLoaded) return;

    // Only save if the requested value differs from the known server state
    const currentValStr = JSON.stringify(value);
    if (currentValStr === serverValueStr.current) {
      return;
    }

    console.log(
      `[useFirestoreSync] ${collectionName}/${docId} Value changed, attempting save.`,
    );
    const save = async () => {
      try {
        await setDoc(
          doc(db, collectionName, docId),
          { data: value },
          { merge: true },
        );
        console.log(
          `[useFirestoreSync] ${collectionName}/${docId} Save successful.`,
        );
        // Mark what we just successfully sent so we don't send it again
        serverValueStr.current = currentValStr;
      } catch (err) {
        console.error(
          `[useFirestoreSync] ${collectionName}/${docId} Save error:`,
          err,
        );
      }
    };
    save();
  }, [value, isLoaded, collectionName, docId]);

  return [value, setValue];
}

// Removing GlobalDataMenu as requested
