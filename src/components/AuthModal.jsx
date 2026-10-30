import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { VILLES_RDC } from "../data/mockData";
import { Eye, EyeOff, AlertCircle, Phone, Lock, User, MapPin, ArrowLeft } from "lucide-react";

export default function AuthModal({ isOpen, mode = "login", selectedBouquetId = null, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "", phone: "", password: "", confirmPassword: "",
    ville: "Kinshasa", commune: "", quartier: "", avenue: "", parcelleNo: ""
  });

  useEffect(() => {
    if (isOpen) {
      setAuthMode(mode);
      setLoginError("");
      setIsSubmitting(false);
      setFormData({ name: "", phone: "", password: "", confirmPassword: "", ville: "Kinshasa", commune: "", quartier: "", avenue: "", parcelleNo: "" });
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const selectedVilleObj = VILLES_RDC.find(v => v.name === formData.ville) || VILLES_RDC[0];
  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (authMode === "register") {
      if (!formData.name.trim()) { setLoginError("Veuillez entrer votre nom complet."); return; }
      if (!formData.phone.trim()) { setLoginError("Veuillez entrer votre numero de telephone."); return; }
      if (formData.password.length < 4) { setLoginError("Le mot de passe doit contenir au moins 4 caracteres."); return; }
      if (formData.password !== formData.confirmPassword) { setLoginError("Les mots de passe ne correspondent pas."); return; }
      setIsSubmitting(true);
      try { await onLoginSuccess("register", formData, setLoginError); }
      finally { setIsSubmitting(false); }
    } else {
      if (!formData.phone.trim()) { setLoginError("Veuillez entrer votre numero de telephone."); return; }
      if (!formData.password.trim()) { setLoginError("Veuillez entrer votre mot de passe."); return; }
      setIsSubmitting(true);
      try { await onLoginSuccess("auto", formData, setLoginError); }
      finally { setIsSubmitting(false); }
    }
  };

  const handleClose = () => {
    setLoginError("");
    setFormData({ name: "", phone: "", password: "", confirmPassword: "", ville: "Kinshasa", commune: "", quartier: "", avenue: "", parcelleNo: "" });
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={handleClose}>
      <div className="auth-panel" onClick={e => e.stopPropagation()}>

        {/* Logo centre */}
        <div className="auth-logo-block">
          <Logo size={52} showText={true} />
          <p className="auth-tagline">
            {authMode === "login"
              ? "Bienvenue ! Connectez-vous pour acceder a votre espace."
              : "Creez votre compte client gratuitement."}
          </p>
        </div>

        {/* Titre */}
        <h2 className="auth-title">
          {authMode === "login" ? "Connexion" : "Nouveau compte"}
        </h2>

        {/* Erreur */}
        {loginError && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Champs inscription */}
          {authMode === "register" && (
            <>
              <div className="auth-field">
                <label className="auth-label">Nom et Prenom Complet</label>
                <div className="auth-input-wrap">
                  <User size={17} className="auth-input-icon" />
                  <input type="text" className="auth-input" placeholder="Ex : KABAMBA Joseph"
                    value={formData.name} onChange={e => update("name", e.target.value)} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="auth-field">
                  <label className="auth-label">Ville</label>
                  <div className="auth-input-wrap">
                    <MapPin size={17} className="auth-input-icon" />
                    <select className="auth-input auth-select" value={formData.ville}
                      onChange={e => update("ville", e.target.value)}>
                      {VILLES_RDC.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Commune</label>
                  <div className="auth-input-wrap">
                    <MapPin size={17} className="auth-input-icon" />
                    <select className="auth-input auth-select" value={formData.commune}
                      onChange={e => update("commune", e.target.value)}>
                      <option value="">Selectionner...</option>
                      {selectedVilleObj.communes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.7fr", gap: "10px" }}>
                <div className="auth-field">
                  <label className="auth-label">Quartier</label>
                  <input type="text" className="auth-input auth-input-plain" placeholder="Quartier"
                    value={formData.quartier} onChange={e => update("quartier", e.target.value)} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Avenue</label>
                  <input type="text" className="auth-input auth-input-plain" placeholder="Avenue"
                    value={formData.avenue} onChange={e => update("avenue", e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label className="auth-label">N Parcelle</label>
                  <input type="text" className="auth-input auth-input-plain" placeholder="45B"
                    value={formData.parcelleNo} onChange={e => update("parcelleNo", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Telephone */}
          <div className="auth-field">
            <label className="auth-label">Numero de Telephone</label>
            <div className="auth-input-wrap">
              <Phone size={17} className="auth-input-icon" />
              <input type="tel" className="auth-input" placeholder="+243 82 000 0000"
                value={formData.phone} onChange={e => update("phone", e.target.value)} required autoComplete="tel" />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="auth-field">
            <label className="auth-label">Mot de Passe</label>
            <div className="auth-input-wrap">
              <Lock size={17} className="auth-input-icon" />
              <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="..." 
                value={formData.password} onChange={e => update("password", e.target.value)}
                required autoComplete={authMode === "login" ? "current-password" : "new-password"}
                style={{ paddingRight: "44px" }} />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          {authMode === "register" && (
            <div className="auth-field">
              <label className="auth-label">Confirmer le Mot de Passe</label>
              <div className="auth-input-wrap">
                <Lock size={17} className="auth-input-icon" />
                <input type={showConfirm ? "text" : "password"} className="auth-input" placeholder="..."
                  value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                  required autoComplete="new-password" style={{ paddingRight: "44px" }} />
                <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting
              ? <><span className="auth-spinner" /> Chargement...</>
              : authMode === "login" ? "Se Connecter" : "Creer mon Compte"}
          </button>

        </form>

        {/* Pied */}
        <div className="auth-footer">
          {authMode === "login" ? (
            <p>
              Pas encore de compte ?{" "}
              <button type="button" className="auth-switch-link"
                onClick={() => { setAuthMode("register"); setLoginError(""); }}>
                Creer votre compte
              </button>
            </p>
          ) : (
            <p>
              <button type="button" className="auth-switch-link"
                onClick={() => { setAuthMode("login"); setLoginError(""); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ArrowLeft size={14} /> Retour a la connexion
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
