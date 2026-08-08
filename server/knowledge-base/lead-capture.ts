import { storage } from "../storage-simple";
import { emailService } from "../email-service";
import type { InsertLead, InsertInquiry } from "@shared/schema";

export interface SubmitLeadArgs {
  name: string;
  email: string;
  phone?: string;
  requestType: "viewing" | "general_inquiry";
  propertyId?: number;
  preferredDateText?: string;
  preferredDateISO?: string;
  message?: string;
}

export interface SubmitLeadResult {
  success: boolean;
  leadId?: number;
  confirmationNote: string;
}

// Mirrors the lead-creation + email-notification flow used by POST
// /api/leads (server/routes.ts), so a lead submitted from the chatbot
// reaches the same inboxes (Peter, the site manager, and the assigned
// agent) as one submitted through the Contact/Sell Property forms.
export async function submitLead(args: SubmitLeadArgs): Promise<SubmitLeadResult> {
  const source = args.requestType === "viewing"
    ? "AI Chat - Viewing Request"
    : "AI Chat - General Inquiry";

  const messageParts: string[] = [];
  if (args.requestType === "viewing") messageParts.push("Requesting a property viewing.");
  if (args.preferredDateText) messageParts.push(`Preferred time: ${args.preferredDateText}`);
  if (args.message) messageParts.push(args.message);

  const leadData: InsertLead = {
    name: args.name,
    email: args.email,
    phone: args.phone || null,
    message: messageParts.length > 0 ? messageParts.join(" ") : null,
    propertyId: args.propertyId ?? null,
    agentId: null,
    source,
    status: "new",
    priority: args.requestType === "viewing" ? "high" : "medium",
    notes: null,
    agentResponse: null,
    respondedAt: null,
  };

  const lead = await storage.createLead(leadData);

  let propertyTitle: string | undefined;
  let agentName: string | undefined;
  let agentEmail: string | undefined;
  let propertyImage: string | undefined;

  if (args.propertyId) {
    try {
      const property = await storage.getProperty(args.propertyId);
      if (property) {
        propertyTitle = property.title;
        if (property.images && property.images.length > 0) {
          propertyImage = property.images[0];
        }
        if (property.agentId) {
          const agent = await storage.getAgent(property.agentId);
          if (agent) {
            agentName = agent.name;
            agentEmail = agent.email;
          }
        }
      }
    } catch (error) {
      console.error("lead-capture: failed to load property/agent details", error);
    }
  }

  try {
    await emailService.sendLeadNotification({
      type: args.propertyId ? "PROPERTY_INQUIRY" : "NEW_LEAD",
      leadName: args.name,
      leadEmail: args.email,
      leadPhone: args.phone,
      propertyTitle,
      message: leadData.message || undefined,
      source,
      agentName,
      agentEmail,
      propertyId: args.propertyId,
      propertyImage,
    });
  } catch (error) {
    console.error("lead-capture: failed to send email notification", error);
  }

  if (args.requestType === "viewing" && args.propertyId) {
    try {
      const scheduledDate = args.preferredDateISO ? new Date(args.preferredDateISO) : null;
      const inquiryData: InsertInquiry = {
        leadId: lead.id,
        propertyId: args.propertyId,
        type: "viewing",
        scheduledDate: scheduledDate && !isNaN(scheduledDate.getTime()) ? scheduledDate : null,
        status: "pending",
        notes: args.preferredDateText ? `Requested time: ${args.preferredDateText}` : null,
      };
      await storage.createInquiry(inquiryData);
    } catch (error) {
      console.error("lead-capture: failed to create inquiry", error);
    }
  }

  const confirmationNote = args.requestType === "viewing"
    ? `Viewing request submitted for ${propertyTitle || "the property"}${args.preferredDateText ? ` (${args.preferredDateText})` : ""}. Our team will confirm with you shortly.`
    : `Your details have been sent to our team. Someone will be in touch shortly.`;

  return { success: true, leadId: lead.id, confirmationNote };
}
