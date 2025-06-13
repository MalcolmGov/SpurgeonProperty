import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "./db";
import { agents, agentSessions, type Agent, type AgentLogin, type AgentRegistration, type InsertAgent } from "@shared/schema";
import { eq } from "drizzle-orm";

export class AgentAuthService {
  private saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async registerAgent(agentData: AgentRegistration): Promise<Agent> {
    const hashedPassword = await this.hashPassword(agentData.password);
    
    const insertData: InsertAgent = {
      ...agentData,
      password: hashedPassword,
    };

    const [agent] = await db
      .insert(agents)
      .values(insertData)
      .returning();

    return agent;
  }

  async loginAgent(credentials: AgentLogin): Promise<{ agent: Agent; sessionId: string } | null> {
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.email, credentials.email))
      .limit(1);

    if (!agent || !agent.isActive) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(credentials.password, agent.password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await db
      .update(agents)
      .set({ lastLogin: new Date() })
      .where(eq(agents.id, agent.id));

    // Create session
    const sessionId = this.generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(agentSessions).values({
      agentId: agent.id,
      sessionId,
      expiresAt,
    });

    // Remove password from response
    const { password, ...agentWithoutPassword } = agent;

    return {
      agent: agentWithoutPassword as Agent,
      sessionId,
    };
  }

  async validateSession(sessionId: string): Promise<Agent | null> {
    const [session] = await db
      .select({
        agent: agents,
        session: agentSessions,
      })
      .from(agentSessions)
      .innerJoin(agents, eq(agentSessions.agentId, agents.id))
      .where(eq(agentSessions.sessionId, sessionId))
      .limit(1);

    if (!session || session.session.expiresAt < new Date() || !session.agent.isActive) {
      return null;
    }

    // Remove password from response
    const { password, ...agentWithoutPassword } = session.agent;
    return agentWithoutPassword as Agent;
  }

  async logout(sessionId: string): Promise<void> {
    await db
      .delete(agentSessions)
      .where(eq(agentSessions.sessionId, sessionId));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db
      .delete(agentSessions)
      .where(eq(agentSessions.expiresAt, new Date()));
  }

  async getAgentById(id: number): Promise<Agent | null> {
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return null;
    }

    // Remove password from response
    const { password, ...agentWithoutPassword } = agent;
    return agentWithoutPassword as Agent;
  }

  async emailExists(email: string): Promise<boolean> {
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.email, email))
      .limit(1);

    return !!agent;
  }

  async updateAgent(id: number, updateData: Partial<InsertAgent>): Promise<Agent | null> {
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    const [updatedAgent] = await db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, id))
      .returning();

    if (!updatedAgent) {
      return null;
    }

    // Remove password from response
    const { password, ...agentWithoutPassword } = updatedAgent;
    return agentWithoutPassword as Agent;
  }
}

export const agentAuthService = new AgentAuthService();

// Middleware for protecting agent routes
export const requireAgentAuth = async (req: any, res: any, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.agent_session;

  if (!sessionId) {
    return res.status(401).json({ message: "Agent authentication required" });
  }

  const agent = await agentAuthService.validateSession(sessionId);
  if (!agent) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  req.agent = agent;
  next();
};