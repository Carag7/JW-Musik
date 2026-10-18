export async function testWOL() {

  const url =
    "https://wol.jw.org/en/wol/meetings/r1/lp-e/2026/42";

  try {

    const response = await fetch(url);

    console.log("Status:", response.status);

    const html = await response.text();

    console.log("Länge:", html.length);

    alert(
      "Status: " +
      response.status +
      "\nZeichen: " +
      html.length
    );

  } catch (err) {

    console.error(err);

    alert(
      "FEHLER:\n" +
      err.message
    );

  }

}
