import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// New entry</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">NEW_POST</h1>
      </div>
      <PostEditor mode="new" />
    </div>
  );
}
