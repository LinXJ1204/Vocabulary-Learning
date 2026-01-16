"use client";

import type { UserDTO, WordDTO } from "@evb/shared-types";
import { useActionState, useRef, useState, useTransition } from "react";
import { addWordAction, deleteWordAction, ensureUserAction, logoutAction, type ActionState } from "./actions";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { WordSpeaker } from "../../components/WordSpeaker";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-danger">{message}</p>;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function SwipeToDeleteItem(props: {
  title: string;
  onDelete: () => Promise<void>;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [start, setStart] = useState<{ x: number; y: number; pointerId: number } | null>(null);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-md">
      {/* Light-red underlay with delete text */}
      <div className="absolute inset-0 flex items-center justify-start bg-red-50 px-5">
        <div className="text-sm font-semibold text-red-700">
          {isDeleting ? "刪除中..." : "刪除"}
        </div>
      </div>

      {/* Foreground (swipeable) */}
      <div
        className={[
          "relative rounded-md border border-border bg-white p-4 transition-transform",
          isDragging ? "duration-0" : "duration-200",
          "touch-pan-y"
        ].join(" ")}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(e) => {
          // If the confirm modal is open, ignore gestures.
          if (confirmOpen) return;
          setStart({ x: e.clientX, y: e.clientY, pointerId: e.pointerId });
          setIsDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!start || e.pointerId !== start.pointerId) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;

          // Only react to a right swipe and mostly-horizontal motion.
          if (Math.abs(dx) < 4) return;
          if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

          // Prevent page horizontal scroll.
          e.preventDefault();

          const width = containerRef.current?.clientWidth ?? 120;
          const next = clamp(dx, 0, width);
          setOffset(next);
        }}
        onPointerUp={(e) => {
          if (!start || e.pointerId !== start.pointerId) return;
          setIsDragging(false);
          setStart(null);

          const width = containerRef.current?.clientWidth ?? 120;
          const shouldConfirm = offset >= width * 0.3;

          if (!shouldConfirm) {
            setOffset(0);
            return;
          }

          // Swipe triggers confirm modal.
          setConfirmOpen(true);
        }}
        onPointerCancel={() => {
          setIsDragging(false);
          setStart(null);
          setOffset(0);
        }}
      >
        {props.children}

        {/* Non-touch fallback: show a subtle delete button on hover/focus */}
        <div className="pointer-events-none absolute bottom-3 right-3 hidden md:block">
          <span className="rounded-full border border-border bg-white px-2 py-1 text-xs text-mutedForeground">
            右滑刪除
          </span>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setOffset(0);
        }}
        title="確認刪除"
        description={`確定要刪除「${props.title}」嗎？此操作無法復原。`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmOpen(false);
                setOffset(0);
              }}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              type="button"
              className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              variant="ghost"
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await props.onDelete();
                } finally {
                  setIsDeleting(false);
                  setConfirmOpen(false);
                  setOffset(0);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "刪除中..." : "刪除"}
            </Button>
          </>
        }
      />
    </div>
  );
}

export function WordsClient(props: {
  user: { id: string; email: string };
  words: WordDTO[];
}) {
  const [addState, addAction, addPending] = useActionState<ActionState<WordDTO>, FormData>(
    addWordAction,
    { ok: true }
  );
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
  const [, startDelete] = useTransition();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <header className="flex gap-3 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Words</h1>
          <div className="text-sm text-mutedForeground">
            <span className="font-medium text-foreground">{props.user.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add word</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3 sm:flex-row sm:items-end" action={addAction}>
              <label className="grid flex-1 gap-2">
                <Input name="text" placeholder="hello" disabled={addPending} />
              </label>
              <Button type="submit" disabled={addPending} className="w-full sm:w-auto">
                {addPending ? "Adding..." : "Add"}
              </Button>
            </form>
            <ErrorText message={addState.ok ? undefined : addState.error} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Your list</CardTitle>
              <Badge>{props.words.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {props.words.length === 0 ? (
              <p className="text-sm text-mutedForeground">No words yet. Add your first one above.</p>
            ) : (
              <ul className="grid gap-4">
                {deleteError ? <ErrorText message={deleteError} /> : null}
                {props.words.map((w) => (
                  <li key={w.id}>
                    {(() => {
                      const ex = w.examples[0];
                      const meaning = w.info.definition; // assumed to be 中文解釋 from AI
                      const part = w.info.partOfSpeech ?? "-";
                      const exampleSentence = ex?.example ?? "-";
                      const exampleTranslation = ex?.translation ?? "-";

                      return (
                        <SwipeToDeleteItem
                          title={w.text}
                          onDelete={async () => {
                            setDeleteError(undefined);
                            startDelete(async () => {
                              const res = await deleteWordAction(w.id);
                              if (!res.ok) setDeleteError(res.error);
                            });
                          }}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <div className="mb-4 flex items-center justify-between gap-2">
                                <div className="text-2xl font-semibold">{w.text}</div>
                                <WordSpeaker text={w.text} />
                              </div>
                              <div className="text-sm text-mutedForeground">
                                <span className="font-medium text-foreground">中文釋義</span>：{" "}
                                {meaning || "—"}
                              </div>
                            </div>
                  {/*           <div className="text-xs text-mutedForeground sm:text-right">
                              <div>建立時間</div>
                              <div className="font-mono">{new Date(w.createdAt).toLocaleString()}</div>
                            </div> */}
                          </div>

                          <div className="mt-2 grid gap-2 text-sm leading-relaxed break-words">
                            <div>
                              <span className="font-medium">詞性</span>：
                              
                              <span className="text-mutedForeground"> {part}</span>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <div className="font-medium">例句：</div>
                                <WordSpeaker text={exampleSentence} ariaLabel="播放例句發音" rate={0.95} size="sm" />
                              </div>
                              <div className="flex items-start py-1">
                                <span className="text-mutedForeground"> {exampleSentence}</span>
                              </div>
                            </div>
{/*                             <div>
                              <span className="font-medium">例句翻譯</span>：
                              <span className="text-mutedForeground"> {exampleTranslation}</span>
                            </div> */}
                          </div>

                          {/* <div className="mt-3 flex flex-wrap gap-2">
                            <Badge>複習次數：{w.stats.reviewCount}</Badge>
                            {w.stats.nextReviewDate ? (
                              <Badge>
                                下次複習：{new Date(w.stats.nextReviewDate).toLocaleDateString()}
                              </Badge>
                            ) : (
                              <Badge>下次複習：—</Badge>
                            )}
                          </div> */}
                        </SwipeToDeleteItem>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export function SignInClient() {
  const [state, action, pending] = useActionState<ActionState<UserDTO>, FormData>(
    ensureUserAction,
    { ok: true }
  );

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-mutedForeground">
            Enter your email to create or load your account.
          </p>

          <form action={action} className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm text-mutedForeground">Email</span>
              <Input name="email" placeholder="you@example.com" disabled={pending} />
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Working..." : "Continue"}
            </Button>
          </form>
          <ErrorText message={state.ok ? undefined : state.error} />
        </CardContent>
      </Card>
    </main>
  );
}

