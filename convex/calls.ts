import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateCallCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${part()}-${part()}`;
}

export const createCall = mutation({
  args: { offer: v.string() },
  handler: async (ctx, { offer }) => {
    const callCode = generateCallCode();

    await ctx.db.insert("calls", {
      callCode,
      status: "waiting",
      callerOffer: offer,
      createdAt: Date.now(),
    });

    return { callCode };
  },
});

export const getCallByCode = query({
  args: { callCode: v.string() },
  handler: async (ctx, { callCode }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .unique();

    return call ?? null;
  },
});

export const submitAnswer = mutation({
  args: { callCode: v.string(), answer: v.string() },
  handler: async (ctx, { callCode, answer }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .unique();

    if (!call) throw new Error("Call not found");

    await ctx.db.patch(call._id, {
      calleeAnswer: answer,
      status: "connected",
    });
  },
});

export const watchCall = query({
  args: { callCode: v.string() },
  handler: async (ctx, { callCode }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .unique();

    return call ?? null;
  },
});

export const endCall = mutation({
  args: { callCode: v.string() },
  handler: async (ctx, { callCode }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .unique();

    if (!call) return;

    await ctx.db.patch(call._id, { status: "ended" });
  },
});

export const deleteCall = mutation({
  args: { callCode: v.string() },
  handler: async (ctx, { callCode }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .unique();

    if (call) await ctx.db.delete(call._id);

    const candidates = await ctx.db
      .query("iceCandidates")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .collect();

    for (const c of candidates) {
      await ctx.db.delete(c._id);
    }
  },
});
