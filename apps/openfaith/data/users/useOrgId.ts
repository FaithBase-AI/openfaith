import { useRouter } from "@tanstack/react-router";
import { Option, pipe } from "effect";

export function useOrgId() {
  const router = useRouter();
  const { session } = router.options.context;

  return pipe(
    session.data,
    Option.fromNullable,
    Option.match({
      onNone: () => "",
      onSome: (data) => data.activeOrganizationId,
    }),
  );
}
