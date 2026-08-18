import Image from "next/image";
import ContentPanel from "../components/content-panel";
import ReaderPage from "../components/reader-page";

export default function Home() {
  return (
    <>
    <ContentPanel>
      <ReaderPage></ReaderPage>
    </ContentPanel>
    </>
  );
}
