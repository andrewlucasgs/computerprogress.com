import Head from "next/head";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import Main from "../../components/Main";
import Footer from "../../components/Footer";
import { getDataset } from "../../lib/api";
import { parseBenchmark } from "../../lib/parser";

export default function Home({ benchmarks, dataset, accuracyTypes }) {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-full">
        <Navbar></Navbar>
        <Header benchmarks={benchmarks}></Header>
        <Main accuracyTypes={accuracyTypes} dataset={dataset} benchmarks={benchmarks}></Main>
        <Footer className="bg-black/100" />
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const [benchmarks, benchmark] = await Promise.all([
    getDataset("benchmarks"),
    getDataset(params.slug),
  ]);
  const { dataset, accuracyTypes } = await parseBenchmark(benchmark);
  return {
    props: {
      benchmarks,
      dataset,
      accuracyTypes,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second
    // revalidate: 60, // In seconds
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking", // false or 'blocking'
  };
}
