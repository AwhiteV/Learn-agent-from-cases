import { ChatConsole } from "@/components/chat-console";
import { getDefaultProviderId, getProviderSummaries } from "@/lib/providers";

export default function Home() {
  const providers = getProviderSummaries();
  const defaultProviderId = getDefaultProviderId();

  return <ChatConsole defaultProviderId={defaultProviderId} providers={providers} />;
}
