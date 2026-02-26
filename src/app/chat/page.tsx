// "use client";
// import { Thread } from "@/components/assistant-ui/thread";
// import { AssistantRuntimeProvider } from "@assistant-ui/react";
// import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
// export default function Home() {
//   const runtime = useChatRuntime();
//   return (
//     <AssistantRuntimeProvider runtime={runtime}>
//       <div className="h-full">
//         <Thread />
//       </div>
//     </AssistantRuntimeProvider>
//   );
// }

import { Assistant } from "@/components/assistant-ui/assistant";

export default function Home() {
  return <Assistant />;
}
