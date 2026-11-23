"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorNote, FieldLabel, Loading } from "@/components/ui/misc";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";

/** Engellediklerin. Engel iki yönlüdür (ADR-028): eşleştirmede birbirinize düşmezsiniz. */
export function BlockedList() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: qk.blocked(), queryFn: () => getRepository().listBlocked() });
  const unblock = useMutation({
    mutationFn: (userId: string) => getRepository().unblockUser(userId),
    onSuccess: () => qc.invalidateQueries(),
  });
  return (
    <section className="flex flex-col gap-3">
      <FieldLabel hint="Engellediğin kişiyle birbirinize soru atanmaz ve havuzda birbirinizin sorularını görmezsiniz.">Engellenenler</FieldLabel>
      {list.isLoading && <Loading />}
      <ErrorNote error={list.error} />
      <ErrorNote error={unblock.error} />
      {list.data?.length === 0 && <p className="text-[15px] text-gray">Kimseyi engellemedin.</p>}
      <ul className="divide-y divide-line">
        {list.data?.map((b) => (
          <li key={b.user.id} className="flex items-center justify-between gap-3 py-3">
            <span className="flex min-w-0 items-center gap-3">
              <Avatar name={b.user.name} color={b.user.color} size={36} />
              <span className="truncate text-base font-semibold">{b.user.name}</span>
            </span>
            <Button variant="secondary" size="md" onClick={() => unblock.mutate(b.user.id)} disabled={unblock.isPending} aria-label={`${b.user.name} engelini kaldır`}>
              Engeli kaldır
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
