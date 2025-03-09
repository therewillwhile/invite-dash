import { toast } from "sonner";

const API_URL = "https://hd.vcomputer.ru";
const API_TOKEN = "07bf820816b64ff3a98794552d7e90b1";

type User = {
  id: string;
  name: string;
  isAdmin: boolean;
  inviteCount: number;
  invitedBy?: string;
  invitedUsers: string[];
};

type Ticket = {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdAt: string;
  response?: string;
};

type Invite = {
  code: string;
  createdBy: string;
  createdAt: string;
  used: boolean;
  usedBy?: string;
};

// Local storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

// Auth methods
export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    // This would be a real API call in production
    const mockUsers = localStorage.getItem("mock_users");
    const users = mockUsers ? JSON.parse(mockUsers) : [];
    
    const user = users.find((u: any) => u.name.toLowerCase() === username.toLowerCase());
    
    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const token = btoa(`${username}:${password}`);
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { token, user: userWithoutPassword };
  } catch (error: any) {
    toast.error(error.message || "Failed to login");
    throw error;
  }
};

export const register = async (
  inviteCode: string,
  username: string,
  password: string
): Promise<{ token: string; user: User }> => {
  try {
    // Validate the invite code first (using mock data for now)
    const mockInvites = localStorage.getItem("mock_invites");
    const invites = mockInvites ? JSON.parse(mockInvites) : [];
    
    const invite = invites.find((i: any) => i.code === inviteCode && !i.used);
    
    if (!invite) {
      throw new Error("Invalid or already used invite code");
    }
    
    // Now register the user with the API
    const response = await fetch(`${API_URL}/Users/New`, {
      method: "POST",
      headers: {
        "X-Emby-Token": API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: username,
        Password: password,
      }),
    });
    
    if (response.status === 400) {
      throw new Error("Username already exists");
    }
    
    if (!response.ok) {
      throw new Error("Failed to register user");
    }
    
    // Get the inviter's invite count to calculate this user's invite count
    const mockUsers = localStorage.getItem("mock_users") || "[]";
    const users = JSON.parse(mockUsers);
    
    const inviter = users.find((u: any) => u.id === invite.createdBy);
    const inviteCount = inviter?.isAdmin ? 5 : Math.max(0, (inviter?.inviteCount || 0) - 1);
    
    // Create the user in our mock system
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      name: username,
      password,
      isAdmin: false,
      inviteCount,
      invitedBy: invite.createdBy,
      invitedUsers: [],
    };
    
    // Update the invite to be used
    invite.used = true;
    invite.usedBy = newUser.id;
    
    // Update the inviter's invited users list
    if (inviter) {
      inviter.invitedUsers = [...inviter.invitedUsers, newUser.id];
    }
    
    // Save everything to localStorage for our mock backend
    localStorage.setItem("mock_invites", JSON.stringify(invites));
    
    users.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(users));
    
    // Set up auth data
    const { password: _, ...userWithoutPassword } = newUser;
    const token = btoa(`${username}:${password}`);
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { token, user: userWithoutPassword };
  } catch (error: any) {
    toast.error(error.message || "Failed to register");
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/";
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Invites methods
export const createInvite = async (): Promise<Invite> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error("You must be logged in to create an invite");
    }
    
    if (currentUser.inviteCount <= 0 && !currentUser.isAdmin) {
      throw new Error("You don't have any invites left");
    }
    
    // Generate a random code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const invite: Invite = {
      code,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      used: false,
    };
    
    // Update the user's invite count if not admin
    if (!currentUser.isAdmin) {
      currentUser.inviteCount -= 1;
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      
      // Also update in the mock_users
      const mockUsers = localStorage.getItem("mock_users");
      if (mockUsers) {
        const users = JSON.parse(mockUsers);
        const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
        if (userIndex !== -1) {
          users[userIndex].inviteCount = currentUser.inviteCount;
          localStorage.setItem("mock_users", JSON.stringify(users));
        }
      }
    }
    
    // Save the invite
    const mockInvites = localStorage.getItem("mock_invites");
    const invites = mockInvites ? JSON.parse(mockInvites) : [];
    invites.push(invite);
    localStorage.setItem("mock_invites", JSON.stringify(invites));
    
    return invite;
  } catch (error: any) {
    toast.error(error.message || "Failed to create invite");
    throw error;
  }
};

export const getMyInvites = async (): Promise<Invite[]> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error("You must be logged in to view invites");
    }
    
    const mockInvites = localStorage.getItem("mock_invites");
    const invites = mockInvites ? JSON.parse(mockInvites) : [];
    
    return invites.filter((invite: Invite) => invite.createdBy === currentUser.id);
  } catch (error: any) {
    toast.error(error.message || "Failed to get invites");
    throw error;
  }
};

export const getInviteByCode = async (code: string): Promise<Invite | null> => {
  try {
    const mockInvites = localStorage.getItem("mock_invites");
    const invites = mockInvites ? JSON.parse(mockInvites) : [];
    
    return invites.find((invite: Invite) => invite.code === code) || null;
  } catch (error: any) {
    toast.error(error.message || "Failed to get invite");
    throw error;
  }
};

// Tickets methods
export const createTicket = async (title: string, description?: string): Promise<Ticket> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error("You must be logged in to create a ticket");
    }
    
    const ticket: Ticket = {
      id: Date.now().toString(),
      title,
      description,
      status: "pending",
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    
    // Save the ticket
    const mockTickets = localStorage.getItem("mock_tickets");
    const tickets = mockTickets ? JSON.parse(mockTickets) : [];
    tickets.push(ticket);
    localStorage.setItem("mock_tickets", JSON.stringify(tickets));
    
    return ticket;
  } catch (error: any) {
    toast.error(error.message || "Failed to create ticket");
    throw error;
  }
};

export const getMyTickets = async (): Promise<Ticket[]> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      throw new Error("You must be logged in to view tickets");
    }
    
    const mockTickets = localStorage.getItem("mock_tickets");
    const tickets = mockTickets ? JSON.parse(mockTickets) : [];
    
    return tickets.filter((ticket: Ticket) => ticket.createdBy === currentUser.id);
  } catch (error: any) {
    toast.error(error.message || "Failed to get tickets");
    throw error;
  }
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("You must be an admin to view all tickets");
    }
    
    const mockTickets = localStorage.getItem("mock_tickets");
    const tickets = mockTickets ? JSON.parse(mockTickets) : [];
    
    return tickets;
  } catch (error: any) {
    toast.error(error.message || "Failed to get tickets");
    throw error;
  }
};

export const respondToTicket = async (
  ticketId: string,
  status: "approved" | "rejected",
  response?: string
): Promise<Ticket> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("You must be an admin to respond to tickets");
    }
    
    const mockTickets = localStorage.getItem("mock_tickets");
    if (!mockTickets) {
      throw new Error("Ticket not found");
    }
    
    const tickets = JSON.parse(mockTickets);
    const ticketIndex = tickets.findIndex((t: Ticket) => t.id === ticketId);
    
    if (ticketIndex === -1) {
      throw new Error("Ticket not found");
    }
    
    tickets[ticketIndex].status = status;
    tickets[ticketIndex].response = response;
    
    localStorage.setItem("mock_tickets", JSON.stringify(tickets));
    
    return tickets[ticketIndex];
  } catch (error: any) {
    toast.error(error.message || "Failed to respond to ticket");
    throw error;
  }
};

// Users methods
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("You must be an admin to view all users");
    }
    
    const mockUsers = localStorage.getItem("mock_users");
    const users = mockUsers ? JSON.parse(mockUsers) : [];
    
    // Don't return passwords
    return users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error: any) {
    toast.error(error.message || "Failed to get users");
    throw error;
  }
};

export const makeAdmin = async (userId: string): Promise<User> => {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error("You must be an admin to make another user admin");
    }
    
    const mockUsers = localStorage.getItem("mock_users");
    if (!mockUsers) {
      throw new Error("User not found");
    }
    
    const users = JSON.parse(mockUsers);
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    users[userIndex].isAdmin = true;
    localStorage.setItem("mock_users", JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  } catch (error: any) {
    toast.error(error.message || "Failed to make user admin");
    throw error;
  }
};

// Initialize mock data if it doesn't exist
export const initMockData = (): void => {
  if (!localStorage.getItem("mock_users")) {
    const adminUser = {
      id: "admin-id",
      name: "admin",
      password: "11235813213455m",
      isAdmin: true,
      inviteCount: Infinity,
      invitedUsers: [],
    };
    
    localStorage.setItem("mock_users", JSON.stringify([adminUser]));
  }
  
  if (!localStorage.getItem("mock_invites")) {
    localStorage.setItem("mock_invites", JSON.stringify([]));
  }
  
  if (!localStorage.getItem("mock_tickets")) {
    localStorage.setItem("mock_tickets", JSON.stringify([]));
  }
};

// Types exports
export type { User, Ticket, Invite };
