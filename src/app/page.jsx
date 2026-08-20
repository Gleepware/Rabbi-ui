"use client";

import ContentPanel from "../components/content-panel";
import Navbar from "../components/navbar";
import ReaderPage from "../components/reader-page";
import Conversation from "../components/questions/conversations";
import { useReaderContext } from "../contexts/AppContext";

const Error = () => {
  return <>
    Unexpected error.
  </>
}

const Placeholder = () => {
  return <>
    Under Construction
  </>
}

const activities = {
  "Reader": ReaderPage,
  "Conversation": Conversation,
  "About Rabbi": Placeholder,
  "Exit": Placeholder
}

const menuActivities = [
  { key: "Conversation", label: "Manage Conversations" },
  { key: "About Rabbi", label: "About Rabbi" },
  { key: "Exit", label: "Exit" }
]

export default function Home() {
  const { activity, setActivity } = useReaderContext();
  const ActiveComponent = activities[activity] ?? Error;

  const switchActivity = (newActivity) => {
    setActivity(newActivity)
  }

  const handleCloseEvent = () => {
    if (activity !== "Reader") setActivity("Reader")
  }


  return (
    <>
      <Navbar options={menuActivities} onSelect={(item) => switchActivity(item)} />
      <ContentPanel>
        <ActiveComponent onClose={() => handleCloseEvent()}/>
      </ContentPanel>
    </>
  );
}
