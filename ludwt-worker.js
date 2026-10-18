async function handleLudwt(request, env, path) {

  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (path === "/ludwt/list") {

    const obj = await env.MUSIK.get("ludwt/index.json");

    if (!obj) {
      return new Response(
        JSON.stringify([]),
        {
          headers: {
            ...cors,
            "content-type": "application/json"
          }
        }
      );
    }

    return new Response(obj.body, {
      headers: {
        ...cors,
        "content-type": "application/json"
      }
    });
  }

  if (path === "/ludwt/update") {

    const result = {
      updated: new Date().toISOString(),
      weeks: []
    };

    await env.MUSIK.put(
      "ludwt/index.json",
      JSON.stringify(result, null, 2),
      {
        httpMetadata: {
          contentType: "application/json"
        }
      }
    );

    return new Response(
      JSON.stringify({
        ok: true
      }),
      {
        headers: {
          ...cors,
          "content-type": "application/json"
        }
      }
    );
  }

  return new Response(
    "not found",
    {
      status: 404,
      headers: cors
    }
  );
}
