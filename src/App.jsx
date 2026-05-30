import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Zap, Camera, Upload, Trash2, Download, LogOut, Image as ImageIcon, Clock, Plus, X, Eye, Check, EyeOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE SEGURA ---

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// --- COMPONENTE: NEON BUTTON ---
function NeonButton({ children, color = 'pink', onClick, className = '', disabled = false, icon: Icon }) {
  const colorClasses = {
    red: 'border-red-600 text-red-500 hover:bg-red-600 hover:text-white',
    orange: 'border-orange-500 text-orange-500 hover:bg-orange-600 hover:text-white',
    yellow: 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900',
    green: 'border-lime-500 text-lime-500 hover:bg-lime-600 hover:text-slate-900',
    cyan: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-slate-900',
    blue: 'border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white',
    purple: 'border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white',
    pink: 'border-pink-600 text-pink-500 hover:bg-pink-600 hover:text-white',
    rainbow: 'border-transparent text-white bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-lime-500 via-cyan-500 to-purple-600 bg-[length:200%_auto] animate-rainbow'
  };

  return (
    <button disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-black/20 ${colorClasses[color]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}

// --- COMPONENTE: PANTALLA DE LOGIN ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError('Error al iniciar modo demo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `@keyframes rainbowMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .animate-rainbow { background-size: 200% 200%; animation: rainbowMove 4s ease infinite; }` }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-700/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-pink-500/10 backdrop-blur-md relative z-10">
        <div className="text-center mb-10">
          <Zap className="mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={48} />
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-lime-500 via-cyan-500 to-purple-600 uppercase tracking-widest mb-1 animate-rainbow drop-shadow-lg">BABEL</h1>
          <p className="text-pink-500 tracking-[0.3em] font-bold text-sm uppercase">Discoteca</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-lg" required />
          {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
          
          <NeonButton type="submit" color="rainbow" className="w-full py-4 text-lg border-0" disabled={loading}>
            {loading ? 'Procesando...' : 'Ingresar'}
          </NeonButton>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="bg-cyan-900/30 border border-cyan-500/40 p-3 rounded-xl mb-4 text-center">
            <p className="text-[11px] text-cyan-300 font-medium uppercase tracking-wider leading-relaxed">
              Para <strong className="text-cyan-400 font-black">vincular PC y Celular en tiempo real</strong>, asegúrate de iniciar sesión con el mismo correo y contraseña.
            </p>
          </div>
          <button onClick={handleDemoLogin} type="button" className="w-full text-purple-400 hover:text-purple-300 transition-colors text-sm uppercase tracking-wider font-semibold bg-purple-500/20 py-3 rounded-xl border border-purple-500/30">
            Ingresar Modo Local (Sin Sincronización)
          </button>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: DASHBOARD PRINCIPAL ---
function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('efectivo'); // 'efectivo' o 'qr'
  const [fichas, setFichas] = useState([]);
  const [settings, setSettings] = useState({ qrs: [], numeroTalonarioActual: 1, limiteTalonario: 100, talonarioSerie: 'A' });
  const [isUploading, setIsUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState({ file: null, base64: null, targetIds: [] });
  const [viewingImage, setViewingImage] = useState(null);
  const [fichaToDelete, setFichaToDelete] = useState(null);
  const [fichaToReturn, setFichaToReturn] = useState(null);
  const [modalMessage, setModalMessage] = useState({ show: false, title: '', message: '', type: 'info' });
  const [toastMessage, setToastMessage] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isCensored, setIsCensored] = useState(false);

  // Estado del Carrito / Acumulador
  const [carrito, setCarrito] = useState([]); // [{ numero: 1, monto: 30 }, ...]
  const [selectedPendientes, setSelectedPendientes] = useState(new Set());

  // Nuevo talonario (para configurarlo manualmente)
  const [showConfigTalonario, setShowConfigTalonario] = useState(false);
  const [formTalonario, setFormTalonario] = useState({ serie: 'A', inicial: 1, capacidad: 100 });

  const cameraInputRef = useRef(null);
  const qrUploadRef = useRef(null);
  const [activeFichaIdForReceipt, setActiveFichaIdForReceipt] = useState(null);

  const basePath = `users/${user.uid}`;
  const fichasRef = collection(db, `${basePath}/fichas`);
  const settingsDocRef = doc(db, `${basePath}/settings`, 'appSettings');

  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(fichasRef, orderBy('createdAt', 'desc'));
    const unsubFichas = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFichas(data);
    }, (error) => console.error("Error fetching fichas:", error));

    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (error) => console.error("Error fetching settings:", error));

    return () => { unsubFichas(); unsubSettings(); };
  }, [user, basePath]);

  const showMessage = (title, message, type = 'info') => setModalMessage({ show: true, title, message, type });

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ show: true, title, message, type });
    setTimeout(() => setToastMessage(prev => ({ ...prev, show: false })), 4000);
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;

          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const base64Data = canvas.toDataURL('image/jpeg', 0.5);
          resolve(base64Data);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const guardarTalonario = async () => {
    const numActual = parseInt(formTalonario.inicial);
    const capacidad = parseInt(formTalonario.capacidad);

    if (isNaN(numActual) || numActual < 1 || isNaN(capacidad) || capacidad < 1) {
      showMessage("Error", "Ingresa números válidos mayores a 0", "warning");
      return;
    }

    const limite = numActual + capacidad - 1;

    try {
      await setDoc(settingsDocRef, {
        numeroTalonarioActual: numActual,
        limiteTalonario: limite,
        talonarioSerie: formTalonario.serie
      }, { merge: true });
      showMessage("Éxito", "Talonario nuevo configurado correctamente.", "success");
      setShowConfigTalonario(false);
    } catch (error) {
      showMessage("Error", "Fallo al guardar el talonario.", "error");
    }
  };

  const agregarAlCarrito = (monto) => {
    const numFicha = settings.numeroTalonarioActual + carrito.length;

    if (numFicha > settings.limiteTalonario) {
      showMessage("Talonario Agotado", `Has alcanzado el límite (${settings.limiteTalonario}) de este talonario. Por favor configura uno nuevo.`, "warning");
      return;
    }

    setCarrito([...carrito, { numero: numFicha, monto, serie: settings.talonarioSerie || '' }]);
  };

  const quitarDelCarrito = (index) => {
    const newCarrito = [...carrito];
    newCarrito.splice(index, 1);
    setCarrito(newCarrito);
  };

  const toggleSelection = (id) => {
    const newSelection = new Set(selectedPendientes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPendientes(newSelection);
  };

  const handleBulkReceipt = () => {
    if (selectedPendientes.size === 0) return;
    setActiveFichaIdForReceipt(null); // No es una sola ficha
    const targetIds = Array.from(selectedPendientes);
    // Necesitamos que el selector de archivos sepa que son varias
    // Usamos una variable temporal o pasamos los IDs directamente si fuera posible, 
    // pero el flujo actual usa activeFichaIdForReceipt. Vamos a ajustarlo.
    cameraInputRef.current?.click();
  };

  const procesarCarrito = async (metodo) => { // metodo: 'Efectivo' o 'QR'
    if (carrito.length === 0) return;

    setIsUploading(true);
    try {
      const estado = metodo === 'Efectivo' ? 'Pagado' : 'Pendiente';
      const batch = writeBatch(db);

      carrito.forEach(item => {
        const newFichaRef = doc(fichasRef); // Genera un ID automático para el nuevo doc
        batch.set(newFichaRef, {
          numero: item.numero,
          serie: item.serie,
          monto: item.monto,
          estado: estado,
          metodo: metodo,
          comprobanteUrl: null,
          createdAt: Date.now()
        });
      });

      // Actualizar talonario actual
      const nuevoNumero = settings.numeroTalonarioActual + carrito.length;
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });

      await batch.commit();
      
      let msg = metodo === 'Efectivo' ? "Cobro registrado en Efectivo." : "Enviado a Caja QR como pendiente.";
      let tipoMsg = metodo === 'Efectivo' ? "success" : "info";

      if (nuevoNumero > settings.limiteTalonario) {
        msg += " ¡Atención! El talonario se ha agotado. Crea uno nuevo para seguir operando.";
        tipoMsg = "warning";
      }

      showToast("Operación Exitosa", msg, tipoMsg);
      setCarrito([]);
    } catch (error) {
      console.error("Error al procesar:", error);
      showMessage("Error", "Fallo al registrar.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const ponerEnEspera = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { enEspera: true });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar.", "error");
    }
  };

  const quitarDeEspera = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { enEspera: false });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar.", "error");
    }
  };

  const confirmarEliminarFicha = async () => {
    if (!fichaToDelete) return;
    try {
      const batch = writeBatch(db);
      const fichaRef = doc(db, `${basePath}/fichas`, fichaToDelete);
      batch.delete(fichaRef);

      const nuevoNumero = Math.max(1, settings.numeroTalonarioActual - 1);
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });

      await batch.commit();
      showToast("Éxito", "Ficha eliminada y número retornado.", "success");
    } catch (error) {
      showToast("Error", "No se pudo eliminar.", "error");
    } finally { setFichaToDelete(null); }
  };

  const confirmarDevolverFicha = async () => {
    if (!fichaToReturn) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, `${basePath}/fichas`, fichaToReturn), { estado: 'Devuelta' });
      const nuevoNumero = Math.max(1, settings.numeroTalonarioActual - 1);
      batch.set(settingsDocRef, { numeroTalonarioActual: nuevoNumero }, { merge: true });
      await batch.commit();
      showToast("Éxito", "Ficha devuelta y número retornado.", "success");
    } catch (error) {
      showToast("Error", "No se pudo devolver.", "error");
    } finally { setFichaToReturn(null); }
  };

  const limpiarHistorial = async () => {
    const confirm = window.confirm("¿ESTÁS TOTALMENTE SEGURO? Esta acción eliminará TODAS las fichas del historial de forma permanente. No se puede deshacer.");
    if (!confirm) return;

    setIsUploading(true);
    try {
      const querySnapshot = await getDocs(fichasRef);
      if (querySnapshot.empty) {
        showMessage("Información", "El historial ya está vacío.", "info");
        setIsUploading(false);
        return;
      }

      // Crear un array de promesas de borrado para cada documento.
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(document.ref));

      // Esperar a que todas las promesas de borrado se completen.
      await Promise.all(deletePromises);

      showMessage("Éxito", "Todo el historial ha sido borrado.", "success");
    } catch (error) {
      console.error("Error al limpiar historial:", error);
      showMessage("Error", "Hubo un problema al intentar borrar el historial.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReceiptSelection = async (e) => {
    const file = e.target.files?.[0];
    let targetIds = [];
    if (activeFichaIdForReceipt) {
      targetIds = [activeFichaIdForReceipt];
    } else if (selectedPendientes.size > 0) {
      targetIds = Array.from(selectedPendientes);
    }

    if (!file || targetIds.length === 0) return;

    setIsUploading(true);
    try {
      const base64Image = await compressImage(file);
      setReceiptPreview({ file, base64: base64Image, targetIds });
    } catch (error) {
      showMessage("Error", "No se pudo procesar la imagen.", "error");
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const confirmReceiptUpload = async () => {
    if (!receiptPreview.base64 || receiptPreview.targetIds.length === 0) return;
    setIsUploading(true);
    try {
      const batch = writeBatch(db);
      receiptPreview.targetIds.forEach(id => {
        const fichaRef = doc(db, `${basePath}/fichas`, id);
        batch.update(fichaRef, { comprobanteUrl: receiptPreview.base64, estado: 'Pagado' });
      });
      await batch.commit();

      showToast("Éxito", "Imagen descargada y monto sumado.", "success");
      // Intentar forzar descarga
      try {
        const link = document.createElement("a");
        link.href = receiptPreview.base64;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        link.download = `${dateStr}_${timeStr}-Babel.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("No se pudo descargar automáticamente: ", err);
      }

    } catch (error) {
      showToast("Error", "Error al guardar el comprobante.", "error");
    } finally {
      setIsUploading(false);
      setReceiptPreview({ file: null, base64: null, targetIds: [] });
      setActiveFichaIdForReceipt(null);
      setSelectedPendientes(new Set());
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (settings.qrs?.length >= 3) { showMessage("Límite", "Máximo 3 QRs permitidos.", "warning"); return; }

    setIsUploading(true);
    try {
      const base64QR = await compressImage(file);
      const newQRs = [...(settings.qrs || []), base64QR];
      await setDoc(settingsDocRef, { qrs: newQRs }, { merge: true });
    } catch (error) {
      console.error("Error subiendo QR:", error);
    } finally {
      setIsUploading(false);
      if (qrUploadRef.current) qrUploadRef.current.value = '';
    }
  };

  const eliminarQR = async (index) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este QR?");
    if (!confirm) return;
    try {
      const newQRs = settings.qrs.filter((_, i) => i !== index);
      await updateDoc(settingsDocRef, { qrs: newQRs });
    } catch (error) {
      console.error("Error al borrar QR", error);
    }
  };

  const marcarComoPagado = async (id) => {
    try {
      await updateDoc(doc(db, `${basePath}/fichas`, id), { estado: 'Pagado' });
    } catch (error) {
      showMessage("Error", "No se pudo actualizar el estado.", "error");
    }
  };

  const stats = useMemo(() => {
    let total30 = 0, total40 = 0, totalPendientes = 0;
    fichas.forEach(f => {
      // Filtrar por el tab activo
      if (activeTab === 'efectivo' && f.metodo !== 'Efectivo') return;
      if (activeTab === 'qr' && f.metodo !== 'QR') return;

      if (f.estado === 'Pagado') {
        if (f.monto === 30) total30++;
        if (f.monto === 40) total40++;
      } else if (f.estado === 'Pendiente') {
        totalPendientes++;
      }
    });
    return { total30, total40, montoTotal: (total30 * 30) + (total40 * 40), totalPendientes };
  }, [fichas, activeTab]);

  // Listas divididas y memoizadas para optimizar rendimiento
  const fichasHistorial = useMemo(() =>
    fichas.filter(f => f.metodo === (activeTab === 'efectivo' ? 'Efectivo' : 'QR')),
    [fichas, activeTab]
  );
  const pendientesQR = useMemo(() =>
    fichas.filter(f => f.metodo === 'QR' && f.estado === 'Pendiente'),
    [fichas]
  );

  const exportarExcel = () => {
    if (!window.XLSX) { showMessage("Aviso", "Cargando librería, intenta de nuevo.", "info"); return; }
    const data = fichas.map(f => ({
      'Ficha': f.serie ? `${f.serie}-${f.numero}` : f.numero,
      'Monto (Bs)': f.monto,
      'Estado': f.estado,
      'Método': f.metodo,
      'Fecha': new Date(f.createdAt).toLocaleString(),
      'Comprobante': f.comprobanteUrl ? 'Sí' : 'No'
    }));
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    window.XLSX.writeFile(wb, `Fichas_Babel_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 overflow-x-hidden selection:bg-pink-500/30">
      <style dangerouslySetInnerHTML={{ __html: `@keyframes rainbowMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .animate-rainbow { background-size: 200% 200%; animation: rainbowMove 4s ease infinite; }` }} />

      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex flex-row flex-wrap sm:flex-nowrap justify-between items-center gap-4 shadow-lg shadow-black/20">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-lime-500 via-cyan-500 to-purple-600 animate-rainbow shrink-0">BABEL</h1>

        {/* TAB SELECTOR */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 w-full sm:w-auto order-last sm:order-none justify-center">
          <button onClick={() => setActiveTab('efectivo')} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'efectivo' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-slate-500 hover:text-white'}`}>
            Caja Efectivo
          </button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'qr' ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}>
            Caja QR
          </button>
        </div>

        <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-400 transition-colors p-2 bg-slate-900 rounded-full border border-slate-800 hover:border-red-500/50 shadow-sm shrink-0" title="Cerrar Sesión">
          <LogOut size={20} />
        </button>
      </header>

      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 mt-2 sm:mt-4">
        {/* COLUMNA IZQUIERDA (Controles) */}
        <div className="md:col-span-6 lg:col-span-7 space-y-4 sm:space-y-8">

          {activeTab === 'efectivo' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/20 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={16} className="text-pink-500" /> Nuevo Cobro</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Límite: {settings.limiteTalonario || 100}</span>
                  <button onClick={() => setShowConfigTalonario(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white uppercase font-bold rounded-xl transition-colors border border-slate-700">
                    Nuevo Talonario
                  </button>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-2">Ficha Actual a Emitir</p>
                <span className="text-5xl md:text-6xl font-black text-white">
                  {settings.talonarioSerie && <span className="text-2xl md:text-3xl text-slate-500 mr-2">{settings.talonarioSerie}-</span>}
                  {settings.numeroTalonarioActual > (settings.limiteTalonario || 100) ? 'Agotado' : settings.numeroTalonarioActual + carrito.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <NeonButton color="pink" onClick={() => agregarAlCarrito(30)} disabled={settings.numeroTalonarioActual > (settings.limiteTalonario || 100)} className="h-20 flex-col text-xl shadow-pink-600/20">+ 30 Bs</NeonButton>
                <NeonButton color="cyan" onClick={() => agregarAlCarrito(40)} disabled={settings.numeroTalonarioActual > (settings.limiteTalonario || 100)} className="h-20 flex-col text-xl shadow-cyan-500/20">+ 40 Bs</NeonButton>
              </div>

              {carrito.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mt-6">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Selección Actual</h3>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {carrito.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl text-sm">
                        <span className="font-bold text-slate-300">Ficha {item.serie ? `${item.serie}-` : '#'}{item.numero}</span>
                        <div className="flex items-center gap-3">
                          <span className={item.monto === 30 ? 'text-pink-500 font-black' : 'text-cyan-400 font-black'}>{item.monto} Bs</span>
                          <button onClick={() => quitarDelCarrito(idx)} className="text-slate-500 hover:text-red-400 transition-colors"><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-slate-500 text-xs uppercase font-bold">Total a cobrar:</span>
                    <span className="text-2xl font-black text-white">{carrito.reduce((acc, curr) => acc + curr.monto, 0)} Bs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => procesarCarrito('Efectivo')} className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-lime-500/20">
                      Cobrar Efectivo
                    </button>
                    <button onClick={() => procesarCarrito('QR')} className="bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20">
                      Enviar a QR
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/20">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" /> Fichas Pendientes (Enviadas a QR)
            </h2>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {pendientesQR.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <button
                      onClick={() => setSelectedPendientes(selectedPendientes.size === pendientesQR.length ? new Set() : new Set(pendientesQR.map(f => f.id)))}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      {selectedPendientes.size === pendientesQR.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {selectedPendientes.size} seleccionados
                    </span>
                  </div>
                  {pendientesQR.map(ficha => (
                    <div
                      key={ficha.id}
                      onClick={() => toggleSelection(ficha.id)}
                      className={`bg-slate-950 border cursor-pointer transition-all shadow-lg ${selectedPendientes.has(ficha.id) ? 'border-cyan-500 shadow-cyan-500/10 scale-[1.01]' : ficha.enEspera ? 'border-orange-500/50 shadow-orange-500/10' : 'border-slate-800 shadow-black/20'} p-4 rounded-2xl flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedPendientes.has(ficha.id) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
                          {selectedPendientes.has(ficha.id) && <Check size={14} className="text-slate-900" strokeWidth={4} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
                            <span className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-purple-600/30">QR Pendiente</span>
                            {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30">En Espera</span>}
                          </div>
                          <p className={`text-xl font-black mt-1 ${ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}`}>{ficha.monto} Bs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2" onClick={(e) => e.stopPropagation()}>
                        {ficha.enEspera ? (
                          <button onClick={() => quitarDeEspera(ficha.id)} className="p-2 md:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30" title="Quitar de Espera"><X size={20} /></button>
                        ) : (
                          <button onClick={() => ponerEnEspera(ficha.id)} className="p-2 md:p-3 bg-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white border border-orange-500/30" title="Poner en Espera"><Clock size={20} /></button>
                        )}
                        <button onClick={() => setFichaToReturn(ficha.id)} className="p-2 md:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30" title="Devolver Ficha"><LogOut size={18} className="rotate-180" /></button>
                        <button onClick={() => { setActiveFichaIdForReceipt(ficha.id); cameraInputRef.current?.click(); }} className="px-3 md:px-4 py-2 md:py-3 bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 md:gap-2 text-[10px] md:text-sm shadow-lg shadow-lime-500/20 whitespace-nowrap"><Camera size={16} /> Foto</button>
                      </div>
                    </div>
                  ))}
                </>
              ) : <p className="text-slate-600 text-center py-10 font-bold tracking-widest uppercase">No hay fichas pendientes</p>}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-lg shadow-black/20">
              <p className="text-pink-500 font-bold text-sm uppercase">Total 30 Bs ({activeTab})</p>
              <p className="text-4xl font-black mt-2">{stats.total30}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-lg shadow-black/20">
              <p className="text-cyan-400 font-bold text-sm uppercase">Total 40 Bs ({activeTab})</p>
              <p className="text-4xl font-black mt-2">{stats.total40}</p>
            </div>
            <div className="col-span-2 relative p-[2px] rounded-3xl overflow-hidden shadow-xl shadow-black/20 group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-lime-500 via-cyan-500 to-purple-600 animate-rainbow"></div>
              <div className="relative bg-slate-950 rounded-[22px] p-6 text-center h-full">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">Recaudado Confirmado ({activeTab})</p>
                  <button onClick={() => setIsCensored(!isCensored)} className="text-slate-500 hover:text-white transition-colors">
                    {isCensored ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-5xl font-black text-white flex justify-center items-center gap-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400 text-3xl">Bs.</span>
                  {isCensored ? '●●●●' : stats.montoTotal}
                </div>
              </div>
            </div>
            <div className={`col-span-2 bg-slate-900 border ${stats.totalPendientes > 0 ? 'border-orange-500/50' : 'border-slate-800'} rounded-2xl p-4 text-center flex justify-between items-center transition-colors`}>
              <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">Fichas Pendientes/En Espera ({activeTab}):</span>
              <span className="text-2xl font-black text-orange-500">{stats.totalPendientes}</span>
            </div>
          </section>

          {activeTab === 'qr' && (
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">QRs de Pago</h2>
                <button onClick={() => qrUploadRef.current?.click()} className="text-purple-400 bg-purple-500/20 p-2 rounded-full"><Upload size={20} /></button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {settings.qrs?.length > 0 ? (
                  settings.qrs.map((qr, idx) => (
                    <div key={idx} className="min-w-[150px] aspect-square bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-2 snap-center relative overflow-hidden group">
                      <img src={qr} alt={`QR ${idx}`} onClick={() => setViewingImage(qr)} className="w-full h-full object-contain rounded-xl cursor-pointer" />
                      <button onClick={() => eliminarQR(idx)} className="absolute top-2 right-2 bg-red-600/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                    <ImageIcon size={32} className="mb-2" /><span className="text-sm">Sin QRs</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* COLUMNA DERECHA (Historial) */}
        <div className="md:col-span-6 lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-4 sm:p-6 md:h-[80vh] flex flex-col">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Historial de {activeTab}</h2>
              <div className="flex gap-2">
                <button onClick={exportarExcel} className="flex items-center gap-1 text-xs font-bold bg-lime-500/20 text-lime-400 px-3 py-1.5 rounded-lg border border-lime-500/30 uppercase hover:bg-lime-500 hover:text-slate-900 transition-all"><Download size={14} /> Excel</button>
                <button onClick={limpiarHistorial} className="flex items-center gap-1 text-xs font-bold bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/30 uppercase hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14} /> Limpiar</button>
              </div>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {fichasHistorial.map((ficha) => (
              <div key={ficha.id} className={`bg-slate-950 border ${ficha.enEspera ? 'border-orange-500/30' : 'border-slate-800'} p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-black/30 hover:border-slate-700 transition-colors`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
                    {ficha.estado === 'Pendiente' ? <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/20">Pendiente</span> :
                      ficha.estado === 'Anulada' ? <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-red-500/20">Anulada</span> :
                        ficha.estado === 'Devuelta' ? <span className="bg-slate-600/20 text-slate-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-slate-600/30">Devuelta</span> :
                          <span className="bg-lime-400/10 text-lime-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-lime-400/20">Pagado</span>}
                    {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30">Espera</span>}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{new Date(ficha.createdAt).toLocaleTimeString()} · {ficha.monto > 0 ? <span className={ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}>{ficha.monto} Bs</span> : 'Sin Monto'} · <span className="uppercase text-[10px]">{ficha.metodo}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  {ficha.estado === 'Pendiente' && activeTab === 'efectivo' && (
                    <button onClick={() => marcarComoPagado(ficha.id)} className="p-3 bg-lime-500/20 text-lime-500 rounded-xl hover:bg-lime-500 hover:text-white border border-lime-500/30" title="Marcar como Pagado"><Check size={20} /></button>
                  )}
                  {ficha.comprobanteUrl && (
                    <button onClick={() => setViewingImage(ficha.comprobanteUrl)} className="p-2 sm:p-3 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white border border-purple-500/30" title="Ver Comprobante"><Eye size={18} /></button>
                  )}
                  {ficha.estado !== 'Devuelta' && ficha.estado !== 'Anulada' && (
                    <button onClick={() => setFichaToReturn(ficha.id)} className="p-2 sm:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30" title="Devolver Ficha"><LogOut size={18} className="rotate-180" /></button>
                  )}
                  <button onClick={() => setFichaToDelete(ficha.id)} className="p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30" title="Eliminar"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODALES */}

      {/* MODALES TIPO ALERTA */}
      {showConfigTalonario && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[90] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 relative">
            <button onClick={() => setShowConfigTalonario(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-center">Nuevo Talonario</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Código / Serie (Opcional)</label>
                <input type="text" value={formTalonario.serie} onChange={e => setFormTalonario({ ...formTalonario, serie: e.target.value.toUpperCase() })} placeholder="Ej: A" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Comienza en (*)</label>
                  <input type="number" value={formTalonario.inicial} onChange={e => setFormTalonario({ ...formTalonario, inicial: e.target.value })} min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Cantidad Fichas</label>
                  <input type="number" value={formTalonario.capacidad} onChange={e => setFormTalonario({ ...formTalonario, capacidad: e.target.value })} min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors" required />
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg text-center mt-2">
                <p className="text-xs text-slate-400">Rango generado:</p>
                <p className="text-lime-400 font-black">{formTalonario.serie ? `${formTalonario.serie}-` : ''}{formTalonario.inicial || 1} al {formTalonario.serie ? `${formTalonario.serie}-` : ''}{(parseInt(formTalonario.inicial) || 1) + (parseInt(formTalonario.capacidad) || 100) - 1}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConfigTalonario(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-bold uppercase text-sm">Cancelar</button>
              <button onClick={guardarTalonario} className="flex-1 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-500 transition-colors font-bold uppercase text-sm">Crear</button>
            </div>
          </div>
        </div>
      )}

      {fichaToDelete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/50 rounded-3xl p-6 text-center">
            <Trash2 className="text-red-500 mx-auto mb-4" size={40} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">¿Eliminar Ficha?</h3>
            <p className="text-slate-400 text-sm mb-6">Esto regresará un número al conteo de fichas disponibles.</p>
            <div className="flex gap-3">
              <button onClick={() => setFichaToDelete(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Cancelar</button>
              <button onClick={confirmarEliminarFicha} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold uppercase">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {fichaToReturn && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-500/50 rounded-3xl p-6 text-center">
            <LogOut className="text-slate-400 mx-auto mb-4 rotate-180" size={40} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">¿Devolver Ficha?</h3>
            <p className="text-slate-400 text-sm mb-6">La ficha quedará marcada como Devuelta y su número retornará al conteo disponible.</p>
            <div className="flex gap-3">
              <button onClick={() => setFichaToReturn(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Cancelar</button>
              <button onClick={confirmarDevolverFicha} className="flex-1 py-3 rounded-xl bg-slate-600 text-white font-bold uppercase">Devolver</button>
            </div>
          </div>
        </div>
      )}

      {receiptPreview.base64 && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[95] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-purple-500/50 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4 uppercase">Confirmar Foto</h3>
            <img src={receiptPreview.base64} alt="Preview" className="w-full h-64 object-contain mb-6 rounded-xl border border-slate-800" />
            <div className="flex gap-3 w-full">
              <button onClick={() => setReceiptPreview({ file: null, base64: null, targetIds: [] })} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300">Descartar</button>
              <button onClick={confirmReceiptUpload} className="flex-1 py-3 rounded-xl bg-purple-500 text-white">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setViewingImage(null)}>
          <button className="absolute top-4 right-4 text-white bg-slate-900/50 p-2 rounded-full"><X size={32} /></button>
          <img src={viewingImage} alt="Comprobante Guardado" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {modalMessage.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2 uppercase text-white">{modalMessage.title}</h3>
            <p className="text-slate-300 mb-6">{modalMessage.message}</p>
            <NeonButton color="cyan" onClick={() => setModalMessage({ show: false, title: '', message: '', type: 'info' })} className="w-full">Entendido</NeonButton>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage.show && (
        <div className={`fixed top-4 right-4 z-[110] max-w-sm w-[90%] p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 border backdrop-blur-xl ${
          toastMessage.type === 'success' ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' :
          toastMessage.type === 'warning' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
          toastMessage.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-1">{toastMessage.title}</h4>
              <p className="text-xs font-medium text-slate-200">{toastMessage.message}</p>
            </div>
            <button onClick={() => setToastMessage({ ...toastMessage, show: false })} className="text-white/50 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleReceiptSelection} />
      <input type="file" accept="image/*" ref={qrUploadRef} className="hidden" onChange={handleQRUpload} />

      {isUploading && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-transparent border-t-yellow-400 border-r-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold uppercase tracking-widest animate-pulse">Procesando...</p>
        </div>
      )}

      {/* BARRA FLOTANTE MULTI-SELECCIÓN */}
      {selectedPendientes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[90%] max-w-lg bg-slate-900/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <p className="text-white font-black text-lg">{selectedPendientes.size} <span className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Fichas seleccionadas</span></p>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Listas para comprobante único</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedPendientes(new Set())} className="p-3 text-slate-400 hover:text-white transition-colors" title="Cancelar selección">
              <X size={24} />
            </button>
            <button onClick={handleBulkReceipt} className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
              <Camera size={20} />
              <span>Foto Grupal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (RUTEO) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-t-pink-600 rounded-full animate-spin"></div></div>;
  return user ? <Dashboard user={user} /> : <LoginScreen />;
}
