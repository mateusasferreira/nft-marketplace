import React from "react";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="border-b p-6">
      <h1 className="text-4xl font-bold">Metamarket</h1>
      <div className="flex mt-4">
        <Link href="/">
          <a className="mr-6 text-indigo-500">
            Home
          </a>
        </Link>
        <Link href="/create-asset">
          <a className="mr-6 text-indigo-500">
            Create Asset
          </a>
        </Link>
        <Link href="/my-assets">
          <a className="mr-6 text-indigo-500">
            My Asset
          </a>
        </Link>
        <Link href="/my-creations">
          <a className="mr-6 text-indigo-500">
            My Creations
          </a>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
