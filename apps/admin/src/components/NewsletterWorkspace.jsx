import React, { useEffect, useMemo, useState } from "react";
import {
  createNewsletterList,
  createNewsletterSubscriber,
  sendNewsletterCampaign,
  updateNewsletterSubscriber,
  updateNewsletterTemplate,
  uploadMedia
} from "../api.js";
import { brandAssets } from "../assets.js";
import { createNewsletterPreviewDocument } from "../utils/newsletterPreview.js";
import SectionCard from "./SectionCard.jsx";
import StatusBadge from "./StatusBadge.jsx";

const initialListForm = {
  name: "",
  description: ""
};

const initialSubscriberForm = {
  email: "",
  firstName: "",
  listId: "",
  notes: ""
};

const initialSubscriberDraft = {
  firstName: "",
  notes: "",
  status: "subscribed",
  listIds: []
};

const initialTemplateDraft = {
  name: "",
  subject: "",
  preheader: "",
  heading: "",
  introText: "",
  bodyHtml: "",
  ctaLabel: "",
  ctaUrl: "",
  footerNote: "",
  featureImageUrl: "",
  isActive: true
};

const initialCampaignForm = {
  newsletterListId: "",
  newsletterTemplateId: "",
  campaignName: ""
};

export default function NewsletterWorkspace({ token, newsletter, summary, onRefresh, setMessage }) {
  const [activePanel, setActivePanel] = useState("send");
  const [listForm, setListForm] = useState(initialListForm);
  const [subscriberForm, setSubscriberForm] = useState(initialSubscriberForm);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState("all");
  const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);
  const [subscriberDraft, setSubscriberDraft] = useState(initialSubscriberDraft);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateDraft, setTemplateDraft] = useState(initialTemplateDraft);
  const [campaignForm, setCampaignForm] = useState(initialCampaignForm);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isCreatingSubscriber, setIsCreatingSubscriber] = useState(false);
  const [isUpdatingSubscriber, setIsUpdatingSubscriber] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [isUploadingFeatureImage, setIsUploadingFeatureImage] = useState(false);

  const lists = newsletter?.lists || [];
  const subscribers = newsletter?.subscribers || [];
  const templates = newsletter?.templates || [];
  const campaigns = newsletter?.campaigns || [];

  useEffect(() => {
    if (!lists.length) {
      return;
    }

    setSubscriberForm((current) => ({
      ...current,
      listId: current.listId || String(lists[0].id)
    }));

    setCampaignForm((current) => ({
      ...current,
      newsletterListId: current.newsletterListId || String(lists[0].id)
    }));
  }, [lists]);

  useEffect(() => {
    if (!templates.length) {
      return;
    }

    setSelectedTemplateId((current) => current || templates[0].id);
    setCampaignForm((current) => ({
      ...current,
      newsletterTemplateId: current.newsletterTemplateId || String(templates[0].id)
    }));
  }, [templates]);

  useEffect(() => {
    if (!subscribers.length) {
      setSelectedSubscriberId(null);
      setSubscriberDraft(initialSubscriberDraft);
      return;
    }

    if (!selectedSubscriberId || !subscribers.some((subscriber) => subscriber.id === selectedSubscriberId)) {
      setSelectedSubscriberId(subscribers[0].id);
    }
  }, [selectedSubscriberId, subscribers]);

  useEffect(() => {
    const selectedSubscriber = subscribers.find((subscriber) => subscriber.id === selectedSubscriberId);

    if (!selectedSubscriber) {
      return;
    }

    setSubscriberDraft({
      firstName: selectedSubscriber.first_name || selectedSubscriber.firstName || "",
      notes: selectedSubscriber.notes || "",
      status: selectedSubscriber.status || "subscribed",
      listIds: selectedSubscriber.list_ids || []
    });
  }, [selectedSubscriberId, subscribers]);

  useEffect(() => {
    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

    if (!selectedTemplate) {
      return;
    }

    setTemplateDraft(createTemplateDraft(selectedTemplate));
  }, [selectedTemplateId, templates]);

  const filteredSubscribers = useMemo(() => {
    const search = subscriberSearch.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesSearch =
        !search ||
        [subscriber.email, subscriber.first_name, ...(subscriber.list_names || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      const matchesStatus = subscriberStatusFilter === "all" || subscriber.status === subscriberStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriberSearch, subscriberStatusFilter, subscribers]);

  const selectedSubscriber =
    subscribers.find((subscriber) => subscriber.id === selectedSubscriberId) || filteredSubscribers[0] || null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0] || null;
  const selectedCampaignList = lists.find((list) => String(list.id) === String(campaignForm.newsletterListId)) || null;
  const selectedCampaignTemplate =
    templates.find((template) => String(template.id) === String(campaignForm.newsletterTemplateId)) || null;
  const subscribedCount =
    Number(summary?.newsletterSubscribers || 0) || subscribers.filter((subscriber) => subscriber.status === "subscribed").length;
  const totalLists = Number(summary?.newsletterLists || 0) || lists.length;
  const newsletterPanels = [
    { id: "send", label: "Send", meta: `${campaigns.length} sent` },
    { id: "templates", label: "Templates", meta: `${templates.length} ready` },
    { id: "subscribers", label: "Subscribers", meta: `${subscribedCount} active` },
    { id: "lists", label: "Lists", meta: `${totalLists} list${totalLists === 1 ? "" : "s"}` }
  ];

  async function handleCreateList(event) {
    event.preventDefault();
    setIsCreatingList(true);

    try {
      const response = await createNewsletterList(token, listForm);
      setListForm(initialListForm);
      setMessage(response.message || "Newsletter list created.");
      await onRefresh(true);
      setCampaignForm((current) => ({
        ...current,
        newsletterListId: String(response.list?.id || current.newsletterListId)
      }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsCreatingList(false);
    }
  }

  async function handleCreateSubscriber(event) {
    event.preventDefault();
    setIsCreatingSubscriber(true);

    try {
      const response = await createNewsletterSubscriber(token, {
        ...subscriberForm,
        listId: Number(subscriberForm.listId)
      });
      setSubscriberForm((current) => ({
        ...initialSubscriberForm,
        listId: current.listId
      }));
      setSelectedSubscriberId(response.subscriberId || null);
      setMessage(response.message || "Subscriber saved.");
      await onRefresh(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsCreatingSubscriber(false);
    }
  }

  async function handleSaveSubscriber(event) {
    event.preventDefault();

    if (!selectedSubscriber) {
      return;
    }

    setIsUpdatingSubscriber(true);

    try {
      const response = await updateNewsletterSubscriber(token, selectedSubscriber.id, {
        firstName: subscriberDraft.firstName,
        notes: subscriberDraft.notes,
        status: subscriberDraft.status,
        listIds: subscriberDraft.listIds
      });
      setMessage(response.message || "Subscriber updated.");
      await onRefresh(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUpdatingSubscriber(false);
    }
  }

  async function handleSaveTemplate(event) {
    event.preventDefault();

    if (!selectedTemplate) {
      return;
    }

    setIsSavingTemplate(true);

    try {
      const response = await updateNewsletterTemplate(token, selectedTemplate.id, templateDraft);
      setMessage(response.message || "Template updated.");
      await onRefresh(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSavingTemplate(false);
    }
  }

  async function handleSendCampaign(event) {
    event.preventDefault();

    if (!campaignForm.newsletterListId || !campaignForm.newsletterTemplateId) {
      setMessage("Select a list and template before sending.");
      return;
    }

    const confirmed = window.confirm(
      `Send "${selectedCampaignTemplate?.name || "this template"}" to ${selectedCampaignList?.activeSubscriberCount || 0} subscribed contact(s)?`
    );

    if (!confirmed) {
      return;
    }

    setIsSendingCampaign(true);

    try {
      const response = await sendNewsletterCampaign(token, {
        newsletterListId: Number(campaignForm.newsletterListId),
        newsletterTemplateId: Number(campaignForm.newsletterTemplateId),
        campaignName: campaignForm.campaignName || null
      });
      setCampaignForm((current) => ({
        ...current,
        campaignName: ""
      }));
      setMessage(response.message || "Newsletter campaign sent.");
      await onRefresh(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSendingCampaign(false);
    }
  }

  function openPreviewWindow(template) {
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setMessage("Allow pop-ups so the newsletter preview can open in a new tab.");
      return;
    }

    previewWindow.document.open();
    previewWindow.document.write(createNewsletterPreviewDocument({ ...template, logoUrl: brandAssets.mainLogo }));
    previewWindow.document.close();
    previewWindow.focus();
  }

  async function handleTemplateImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingFeatureImage(true);

    try {
      const response = await uploadMedia(token, file, templateDraft.heading || templateDraft.name || "Newsletter image");
      setTemplateDraft((current) => ({
        ...current,
        featureImageUrl: response.mediaAsset.fileUrl
      }));
      setMessage("Newsletter image uploaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploadingFeatureImage(false);
      event.target.value = "";
    }
  }

  function toggleSubscriberList(listId) {
    setSubscriberDraft((current) => {
      const hasList = current.listIds.includes(listId);
      const nextListIds = hasList ? current.listIds.filter((id) => id !== listId) : [...current.listIds, listId];

      return {
        ...current,
        listIds: nextListIds
      };
    });
  }

  return (
    <div className="newsletter-workspace">
      <div className="newsletter-shell">
        <section className="panel newsletter-nav-panel">
          <div className="newsletter-nav-panel__copy">
            <span className="eyebrow">Newsletter</span>
            <h3>Workspace</h3>
            <p>Choose a section and work inside it.</p>
          </div>

          <div className="newsletter-nav-panel__controls">
            <div className="newsletter-meta-strip">
              <span className="newsletter-chip">{subscribedCount} subscribed</span>
              <span className="newsletter-chip">{templates.length} templates</span>
              <span className="newsletter-chip">{campaigns.length} campaigns</span>
            </div>

            <label className="field field--compact field--compact-inline">
              <span>Open section</span>
              <select value={activePanel} onChange={(event) => setActivePanel(event.target.value)}>
                {newsletterPanels.map((panel) => (
                  <option key={panel.id} value={panel.id}>
                    {panel.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="newsletter-stage">
          {activePanel === "lists" ? (
            <div className="content-grid content-grid--forms newsletter-intro-grid">
        <SectionCard
          eyebrow="Audience lists"
          title="Newsletter lists"
          description="Keep the website sign-up list simple, but create additional lists whenever the client wants to send a more targeted campaign."
        >
          <div className="newsletter-list-grid">
            {lists.map((list) => (
              <article key={list.id} className={`newsletter-list-card ${list.isDefault ? "is-default" : ""}`}>
                <div className="newsletter-list-card__top">
                  <div>
                    <strong>{list.name}</strong>
                    <span>{list.slug}</span>
                  </div>
                  {list.isDefault ? <span className="newsletter-chip newsletter-chip--gold">Website default</span> : null}
                </div>
                <p>{list.description || "No list description yet."}</p>
                <div className="newsletter-list-card__stats">
                  <span>{list.activeSubscriberCount} active</span>
                  <span>{list.subscriberCount} total</span>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Create"
          title="Add a new list"
          description="Build a named audience segment the client can send to later."
          className="section-card--soft"
        >
          <form className="admin-form" onSubmit={handleCreateList}>
            <label className="field">
              <span>List name</span>
              <input
                value={listForm.name}
                onChange={(event) => setListForm({ ...listForm, name: event.target.value })}
                placeholder="Winter specials"
                required
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows="4"
                value={listForm.description}
                onChange={(event) => setListForm({ ...listForm, description: event.target.value })}
                placeholder="Who should receive this list?"
              />
            </label>
            <button className="button button--primary" type="submit" disabled={isCreatingList}>
              {isCreatingList ? "Creating list..." : "Create list"}
            </button>
          </form>
        </SectionCard>
            </div>
          ) : null}

          {activePanel === "subscribers" ? (
            <div className="newsletter-subscriber-layout">
        <SectionCard
          eyebrow="Subscribers"
          title="Newsletter subscribers"
          description="Search the list, see where each contact belongs, and pick one to edit without leaving the page."
        >
          <div className="packages-toolbar newsletter-toolbar">
            <div className="packages-toolbar__filters">
              <input
                value={subscriberSearch}
                onChange={(event) => setSubscriberSearch(event.target.value)}
                placeholder="Search email, first name, or list"
              />
              <select value={subscriberStatusFilter} onChange={(event) => setSubscriberStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
            <div className="packages-toolbar__stats">
              <span>{filteredSubscribers.length} subscriber(s)</span>
            </div>
          </div>

          <div className="table-shell">
            <div className="table-scroll">
              <table className="admin-table newsletter-subscriber-table">
                <thead>
                  <tr>
                    <th>Subscriber</th>
                    <th>Lists</th>
                    <th>Status</th>
                    <th>Last emailed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length ? (
                    filteredSubscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className={selectedSubscriber?.id === subscriber.id ? "is-selected" : ""}
                        onClick={() => setSelectedSubscriberId(subscriber.id)}
                      >
                        <td>
                          <div className="record-primary">
                            <strong>{subscriber.first_name || subscriber.email}</strong>
                            <span>{subscriber.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="newsletter-pill-row">
                            {(subscriber.list_names || []).length ? (
                              subscriber.list_names.map((name) => (
                                <span key={`${subscriber.id}-${name}`} className="newsletter-chip">
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="muted-label">No list assigned</span>
                            )}
                          </div>
                        </td>
                        <td><StatusBadge status={subscriber.status} /></td>
                        <td>{formatDateTime(subscriber.last_emailed_at || subscriber.subscribed_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">No subscribers match the current filters.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <aside className="newsletter-side-stack">
          <SectionCard
            eyebrow="Add subscriber"
            title="Manually add to a list"
            description="Use this when the client wants to add a contact directly from the admin side."
            className="section-card--plain"
          >
            <form className="admin-form" onSubmit={handleCreateSubscriber}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={subscriberForm.email}
                  onChange={(event) => setSubscriberForm({ ...subscriberForm, email: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>First name</span>
                <input
                  value={subscriberForm.firstName}
                  onChange={(event) => setSubscriberForm({ ...subscriberForm, firstName: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Assign to list</span>
                <select
                  value={subscriberForm.listId}
                  onChange={(event) => setSubscriberForm({ ...subscriberForm, listId: event.target.value })}
                  required
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Notes</span>
                <textarea
                  rows="3"
                  value={subscriberForm.notes}
                  onChange={(event) => setSubscriberForm({ ...subscriberForm, notes: event.target.value })}
                  placeholder="Optional source or context"
                />
              </label>
              <button className="button button--primary" type="submit" disabled={isCreatingSubscriber}>
                {isCreatingSubscriber ? "Saving subscriber..." : "Add subscriber"}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            eyebrow="Selected record"
            title={selectedSubscriber ? "Edit subscriber" : "Choose a subscriber"}
            description="Update status, notes, and list membership for the selected contact."
            className="section-card--soft"
          >
            {selectedSubscriber ? (
              <form className="admin-form" onSubmit={handleSaveSubscriber}>
                <div className="newsletter-selected-head">
                  <div>
                    <strong>{selectedSubscriber.email}</strong>
                    <span>{formatDateTime(selectedSubscriber.subscribed_at)}</span>
                  </div>
                  <StatusBadge status={subscriberDraft.status} />
                </div>

                <label className="field">
                  <span>First name</span>
                  <input
                    value={subscriberDraft.firstName}
                    onChange={(event) => setSubscriberDraft({ ...subscriberDraft, firstName: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Status</span>
                  <select
                    value={subscriberDraft.status}
                    onChange={(event) => setSubscriberDraft({ ...subscriberDraft, status: event.target.value })}
                  >
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </label>

                <fieldset className="field-group">
                  <legend>List membership</legend>
                  <div className="newsletter-checklist">
                    {lists.map((list) => (
                      <label key={`subscriber-${selectedSubscriber.id}-list-${list.id}`} className="checkbox-field checkbox-field--tile">
                        <input
                          type="checkbox"
                          checked={subscriberDraft.listIds.includes(list.id)}
                          onChange={() => toggleSubscriberList(list.id)}
                        />
                        <span>{list.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="field">
                  <span>Notes</span>
                  <textarea
                    rows="4"
                    value={subscriberDraft.notes}
                    onChange={(event) => setSubscriberDraft({ ...subscriberDraft, notes: event.target.value })}
                  />
                </label>

                <button className="button button--primary" type="submit" disabled={isUpdatingSubscriber}>
                  {isUpdatingSubscriber ? "Saving changes..." : "Save subscriber"}
                </button>
              </form>
            ) : (
              <div className="empty-state">Select a subscriber from the table to edit it here.</div>
            )}
          </SectionCard>
        </aside>
            </div>
          ) : null}

          {activePanel === "templates" ? (
            <div className="newsletter-template-layout newsletter-template-layout--single">
        <SectionCard
          eyebrow="Templates"
          title={selectedTemplate ? selectedTemplate.name : "Select a template"}
          description="Choose a template, upload imagery, refine the copy, and preview the exact email in a new tab before you send it."
          className="section-card--hero"
          actions={
            <div className="section-actions-row">
              <label className="field field--compact field--compact-inline">
                <span>Template</span>
                <select value={selectedTemplateId || ""} onChange={(event) => setSelectedTemplateId(Number(event.target.value))}>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => openPreviewWindow(templateDraft)}
                disabled={!selectedTemplate}
              >
                Preview email
              </button>
            </div>
          }
        >
          {selectedTemplate ? (
            <div className="newsletter-template-editor">
              <form className="admin-form" onSubmit={handleSaveTemplate}>
                <div className="form-grid form-grid--two">
                  <label className="field">
                    <span>Template name</span>
                    <input
                      value={templateDraft.name}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, name: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Email subject</span>
                    <input
                      value={templateDraft.subject}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, subject: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Preheader</span>
                    <input
                      value={templateDraft.preheader}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, preheader: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Heading</span>
                    <input
                      value={templateDraft.heading}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, heading: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>CTA label</span>
                    <input
                      value={templateDraft.ctaLabel}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, ctaLabel: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>CTA URL</span>
                    <input
                      value={templateDraft.ctaUrl}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, ctaUrl: event.target.value })}
                      placeholder="https://nbgstravel.co.za/packages"
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Intro text</span>
                  <textarea
                    rows="3"
                    value={templateDraft.introText}
                    onChange={(event) => setTemplateDraft({ ...templateDraft, introText: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Body HTML</span>
                  <textarea
                    rows="10"
                    value={templateDraft.bodyHtml}
                    onChange={(event) => setTemplateDraft({ ...templateDraft, bodyHtml: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Footer note</span>
                  <textarea
                    rows="3"
                    value={templateDraft.footerNote}
                    onChange={(event) => setTemplateDraft({ ...templateDraft, footerNote: event.target.value })}
                  />
                </label>

                <div className="newsletter-media-grid newsletter-media-grid--single">
                  <div className="upload-panel">
                    <span>Newsletter image</span>
                    <label className="upload-dropzone upload-dropzone--compact">
                      <input type="file" accept="image/*" onChange={handleTemplateImageUpload} />
                      <strong>{isUploadingFeatureImage ? "Uploading image..." : "Upload newsletter image"}</strong>
                      <span>The top of the email now uses NBGS branding. Add one content image here to support the story below the intro.</span>
                    </label>
                    <input
                      value={templateDraft.featureImageUrl}
                      onChange={(event) => setTemplateDraft({ ...templateDraft, featureImageUrl: event.target.value })}
                      placeholder="Or paste an image URL"
                    />
                    {templateDraft.featureImageUrl ? (
                      <div className="newsletter-image-preview">
                        <img src={templateDraft.featureImageUrl} alt="Newsletter preview" />
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={templateDraft.isActive}
                    onChange={(event) => setTemplateDraft({ ...templateDraft, isActive: event.target.checked })}
                  />
                  <span>Template is active and ready to use</span>
                </label>

                <button className="button button--primary" type="submit" disabled={isSavingTemplate}>
                  {isSavingTemplate ? "Saving template..." : "Save template"}
                </button>
              </form>
            </div>
          ) : (
            <div className="empty-state">Select a template to edit it.</div>
          )}
        </SectionCard>
            </div>
          ) : null}

          {activePanel === "send" ? (
            <div className="newsletter-send-layout">
        <SectionCard
          eyebrow="Send"
          title="Send a newsletter campaign"
          description="Choose the list, pick one of the saved templates, and send directly from the backend."
          className="section-card--accent"
          actions={
            <button
              className="button button--secondary"
              type="button"
              onClick={() => openPreviewWindow(createTemplateDraft(selectedCampaignTemplate || {}))}
              disabled={!selectedCampaignTemplate}
            >
              Preview email
            </button>
          }
        >
          <form className="admin-form" onSubmit={handleSendCampaign}>
            <div className="form-grid form-grid--two">
              <label className="field">
                <span>Send to list</span>
                <select
                  value={campaignForm.newsletterListId}
                  onChange={(event) => setCampaignForm({ ...campaignForm, newsletterListId: event.target.value })}
                  required
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Use template</span>
                <select
                  value={campaignForm.newsletterTemplateId}
                  onChange={(event) => setCampaignForm({ ...campaignForm, newsletterTemplateId: event.target.value })}
                  required
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Campaign name</span>
              <input
                value={campaignForm.campaignName}
                onChange={(event) => setCampaignForm({ ...campaignForm, campaignName: event.target.value })}
                placeholder="Optional internal label"
              />
            </label>

            <div className="newsletter-send-summary">
              <div className="preview-card">
                <span>Recipients</span>
                <strong>{selectedCampaignList?.activeSubscriberCount || 0}</strong>
                <p>{selectedCampaignList?.name || "No list selected"}</p>
              </div>
              <div className="preview-card">
                <span>Template</span>
                <strong>{selectedCampaignTemplate?.name || "Select a template"}</strong>
                <p>{selectedCampaignTemplate?.subject || "Subject will appear here."}</p>
              </div>
            </div>

            <div className="newsletter-send-visuals">
              <div className="newsletter-send-branding">
                <div className="newsletter-send-branding__logo">
                  <img src={brandAssets.mainLogo} alt="NBGS Travel" />
                </div>
                <div className="newsletter-send-branding__copy">
                  <span className="newsletter-chip">NBGS Travel</span>
                  <strong>{selectedCampaignTemplate?.heading || "Select a template to preview the newsletter."}</strong>
                  <p>
                    {selectedCampaignTemplate?.preheader || "The email now opens with NBGS branding details instead of a large hero image."}
                  </p>
                </div>
              </div>
              {selectedCampaignTemplate?.feature_image_url ? (
                <div className="newsletter-send-visuals__image">
                  <img
                    src={selectedCampaignTemplate.feature_image_url}
                    alt={selectedCampaignTemplate?.name || "Newsletter visual"}
                  />
                </div>
              ) : null}
            </div>

            <button className="button button--primary" type="submit" disabled={isSendingCampaign}>
              {isSendingCampaign ? "Sending newsletter..." : "Send newsletter"}
            </button>
          </form>
        </SectionCard>

        <aside className="newsletter-side-stack">
          <SectionCard
            eyebrow="History"
            title="Recent campaigns"
            description="Keep an eye on what was sent, to which list, and whether any recipients failed."
            className="section-card--plain"
          >
            <div className="newsletter-campaign-list">
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <article key={campaign.id} className="newsletter-campaign-item">
                    <div>
                      <strong>{campaign.campaign_name}</strong>
                      <p>{campaign.list_name} | {campaign.template_name}</p>
                      <span>{formatDateTime(campaign.created_at)}</span>
                    </div>
                    <div className="newsletter-campaign-item__meta">
                      <StatusBadge status={campaign.status} />
                      <span>
                        {campaign.sent_count}/{campaign.total_recipients} sent
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">No newsletter campaigns have been sent yet.</div>
              )}
            </div>
          </SectionCard>
        </aside>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function createTemplateDraft(template) {
  return {
    name: template.name || "",
    subject: template.subject || "",
    preheader: template.preheader || "",
    heading: template.heading || "",
    introText: template.intro_text || "",
    bodyHtml: template.body_html || "",
    ctaLabel: template.cta_label || "",
    ctaUrl: template.cta_url || "",
    footerNote: template.footer_note || "",
    featureImageUrl: template.feature_image_url || "",
    isActive: Boolean(template.is_active)
  };
}

function formatDateTime(value) {
  if (!value) {
    return "Not yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
