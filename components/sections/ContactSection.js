import { MapPin, Phone, Mail, Clock3 } from "lucide-react";

export default function ContactSection({ c, companyName, form, setForm, submitContact, sending }) {
  return (
    <section id="contact" className="container l-section reveal">
      <h2 className="center">Connect With <span className="titleGradient">{companyName}</span></h2>
      <div className="contactGrid">
        <form className="l-card contactForm" onSubmit={(e) => { e.preventDefault(); submitContact(); }}>
          <h3>{c.formTitle}</h3>
          <div className="l-grid2"><input placeholder={c.firstNamePlaceholder} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><input placeholder={c.lastNamePlaceholder} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          <input placeholder={c.emailPlaceholder} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea rows={5} placeholder={c.messagePlaceholder} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className={`l-btn ${sending ? "loading" : ""}`} type="submit" disabled={sending}>{sending ? "Sending..." : c.submitText}</button>
        </form>
        <div className="rightInfo">
          <div className="l-card"><strong><MapPin size={16}/> {c.addressTitle}:</strong> {c.addressText}</div>
          <div className="l-card"><strong><Phone size={16}/> {c.phoneTitle}:</strong> {c.phoneText}</div>
          <div className="l-card"><strong><Mail size={16}/> {c.supportEmailTitle}:</strong> {c.supportEmailText}</div>
          <div className="l-card"><strong><Clock3 size={16}/> {c.workTimeTitle}:</strong> {c.workTimeText}</div>
          <iframe className="map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=10.0302408,105.7689046&z=15&output=embed" />
        </div>
      </div>
    </section>
  );
}
