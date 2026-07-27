import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addIceCandidate = mutation({
  args: {
    callCode: v.string(),
    from: v.union(v.literal("caller"), v.literal("callee")),
    candidate: v.string(),
  },
  handler: async (ctx, { callCode, from, candidate }) => {
    await ctx.db.insert("iceCandidates", {
      callCode,
      from,
      candidate,
      createdAt: Date.now(),
    });
  },
});

export const getIceCandidates = query({
  args: {
    callCode: v.string(),
    from: v.union(v.literal("caller"), v.literal("callee")),
  },
  handler: async (ctx, { callCode, from }) => {
    const all = await ctx.db
      .query("iceCandidates")
      .withIndex("by_callCode", (q) => q.eq("callCode", callCode))
      .collect();

    return all.filter((c) => c.from === from);
  },
});
