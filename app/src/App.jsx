import { useState, useEffect } from 'react';
import { getDestinatii, patchVizitat, postDestinatie } from './api/destinatii.js';
import { getNevizitate, totalZile } from './utils/destinatii.js';

import PanouStatistici from './components/PanouStatistici.jsx'
import Rezumat from './components/Rezumat.jsx';
import ListaDestinatii from './components/ListaDestinatii.jsx';
import FormularDestinatie from './components/FormularDestinatie.jsx';
import Cautare from './components/Cautare.jsx';
import './App.css';

export default function App() {
  const [destinatii, setDestinatii] = useState([]);
  const [incarcare, setIncarcare] = useState(true);
  const [eroare, setEroare] = useState(null);
  
  const [filtru, setFiltru] = useState('');
  const [seTrimite, setSeTrimite] = useState(false);

  // Exercițiul 1b: Cererea la server a datelor
  useEffect(() => {
    async function incarca() {
      try {
        const date = await getDestinatii();
        setDestinatii(date);
      } catch (err) {
        setEroare(err.message);
      } finally {
        setIncarcare(false);
      }
    }
    incarca();
  }, []);

  // Exercițiul 1c: Modificarea statusului
  async function handleToggle(id) {
    const d = destinatii.find(x => x.id === id);
    if (!d) return;
    try {
      const salvata = await patchVizitat(id, !d.vizitat);
      setDestinatii((curent) => curent.map((item) => (item.id === id ? salvata : item)));
    } catch (err) {
      alert("Eroare la modificarea destinației!");
    }
  }

  // Exercițiul 2c: Trimiterea noului formular
  async function handleAdd(destinatieNoua) {
    setSeTrimite(true);
    try {
      const salvata = await postDestinatie(destinatieNoua);
      setDestinatii((curent) => [...curent, salvata]);
    } catch (err) {
      alert("Eroare la adăugarea destinației!");
    } finally {
      setSeTrimite(false);
    }
  }

  // Calcularea statisticilor globale (chiar dacă este filtru aplicat)
  const nevizitate = getNevizitate(destinatii);

  // Exercițiul 3b: Filtrarea pe interfață
  const textCautat = filtru.trim().toLowerCase();
  const afisate = destinatii.filter(
    (d) => d.oras.toLowerCase().includes(textCautat) || d.tara.toLowerCase().includes(textCautat)
  );

  // Randarea condiționată
  if (incarcare) return <main><p className="stare">Se încarcă destinațiile...</p></main>;
  if (eroare) return <main><p className="stare eroare">A apărut o eroare: {eroare}</p></main>;

  return (
    <main>
      <h1>City Explorer</h1>
      {/* <PanouStatistici /> */}
      <Rezumat 
        total={destinatii.length} 
        nevizitate={nevizitate.length} 
        zile={totalZile(nevizitate)} 
      />
      
      <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
      <Cautare valoare={filtru} onChange={setFiltru} />
      
      {/* Exercițiul 3c: Stările pentru lista goală */}
      {destinatii.length === 0 ? (
        <p className="gol">Nu există nicio destinație. Adaugă prima din formular.</p>
      ) : afisate.length === 0 ? (
        <p className="gol">Niciun rezultat pentru „{filtru}”.</p>
      ) : (
        <ListaDestinatii destinatii={afisate} onToggle={handleToggle} />
      )}
    </main>
  );
}