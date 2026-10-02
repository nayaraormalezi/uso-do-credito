import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  CUSTOMER_PROFILE,
  VAULT_UPDATED_EVENT,
  formatCustomerAddress,
  loadVaultDocuments,
  persistVaultDocuments,
  type VaultDocument,
} from "../data/customer";
import { useJourney } from "../context/JourneyContext";
import { AdditionalContactsSection } from "../components/AdditionalContactsSection";
import { StatusBanner } from "../components/StatusBanner";

function validityPill(status: "valid" | "expiring" | "expired") {
  if (status === "valid") return "pill pill--success";
  if (status === "expiring") return "pill pill--info";
  return "pill pill--danger";
}

function validityLabel(status: "valid" | "expiring" | "expired") {
  if (status === "valid") return "Válido para reuso";
  if (status === "expiring") return "Próximo do vencimento";
  return "Fora da validade";
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR");
}

export function ProfileView() {
  const { closeProfile } = useJourney();
  const profile = CUSTOMER_PROFILE;
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>(() =>
    loadVaultDocuments(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setVaultDocs(loadVaultDocuments());
    window.addEventListener(VAULT_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(VAULT_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const reusable = vaultDocs.filter((doc) => doc.reusable);
  const expired = vaultDocs.filter((doc) => !doc.reusable);

  const startEdit = (docId: string) => {
    setEditingId(docId);
    fileInputRef.current?.click();
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const docId = editingId;
    event.target.value = "";
    setEditingId(null);
    if (!file || !docId) return;

    const next = vaultDocs.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            typeLabel: file.name,
            fileName: file.name,
            uploadedAt: todayLabel(),
            validityStatus: "valid" as const,
            reusable: true,
            validityLabel:
              doc.id === "vault-address"
                ? "Emitido há no máximo 45 dias"
                : doc.id === "vault-income"
                  ? "Emitido há no máximo 90 dias"
                  : doc.validityLabel,
          }
        : doc,
    );
    setVaultDocs(next);
    persistVaultDocuments(next);
  };

  const renderDoc = (doc: VaultDocument, expiredTone = false) => (
    <article
      key={doc.id}
      className={`vault-doc${expiredTone ? " vault-doc--expired" : ""}`}
    >
      <div>
        <strong>{doc.name}</strong>
        <p className="muted">
          {doc.typeLabel} · Enviado em {doc.uploadedAt}
        </p>
        <p className="muted vault-doc__validity">{doc.validityLabel}</p>
      </div>
      <div className="vault-doc__actions">
        <span className={validityPill(doc.validityStatus)}>
          {validityLabel(doc.validityStatus)}
        </span>
        <button
          type="button"
          className="btn btn--secondary btn--compact"
          onClick={() => startEdit(doc.id)}
        >
          {expiredTone ? "Atualizar documento" : "Editar documento"}
        </button>
      </div>
    </article>
  );

  return (
    <div className="main-panel">
      <StatusBanner
        label="Dados cadastrais"
        title={profile.fullName}
        text="Consulte seus dados de consorciada e os documentos já enviados que podem ser reaproveitados em novas solicitações."
      />

      <section className="section-card">
        <div className="row row--between">
          <h2>Dados do consorciado</h2>
          <span className="pill pill--info">{profile.consorcio.segment}</span>
        </div>
        <div className="grid-2">
          <div className="kv">
            <span>Nome completo</span>
            <strong>{profile.fullName}</strong>
          </div>
          <div className="kv">
            <span>CPF</span>
            <strong>{profile.cpf}</strong>
          </div>
          <div className="kv">
            <span>Data de nascimento</span>
            <strong>{profile.birthDate}</strong>
          </div>
          <div className="kv">
            <span>Estado civil</span>
            <strong>{profile.maritalStatus}</strong>
          </div>
          <div className="kv">
            <span>E-mail</span>
            <strong>{profile.email}</strong>
          </div>
          <div className="kv">
            <span>Telefone</span>
            <strong>{profile.phone}</strong>
          </div>
          <div className="kv">
            <span>Endereço</span>
            <strong>{formatCustomerAddress(profile)}</strong>
          </div>
          <div className="kv">
            <span>Relacionamento</span>
            <strong>
              {profile.consorcio.relationship} · cliente desde{" "}
              {profile.consorcio.clientSince}
            </strong>
          </div>
        </div>
      </section>

      <AdditionalContactsSection />

      <section className="section-card">
        <h3>Documentos disponíveis para reaproveitar</h3>
        <p className="muted">
          Estes documentos já foram enviados anteriormente e ainda estão válidos.
          Se algo mudou, edite e envie uma nova versão.
        </p>
        <div className="vault-docs">
          {reusable.map((doc) => renderDoc(doc))}
        </div>
      </section>

      {expired.length > 0 && (
        <section className="section-card">
          <h3>Documentos que precisam ser atualizados</h3>
          <p className="muted">
            Estes arquivos já existem no histórico, mas não podem ser
            reaproveitados agora — atualize com uma versão válida.
          </p>
          <div className="vault-docs">
            {expired.map((doc) => renderDoc(doc, true))}
          </div>
        </section>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        hidden
        onChange={onFileChange}
      />

      <div className="footer-actions">
        <button type="button" className="btn btn--primary" onClick={closeProfile}>
          Voltar
        </button>
      </div>
    </div>
  );
}
