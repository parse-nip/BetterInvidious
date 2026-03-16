# Serves the React SPA for UI routes when assets/react/index.html exists.
# Serves index.html for SPA routes and static files from the React build.
require "kemal"
require "mime"

module Invidious::HttpServer
  class ReactSpaHandler < Kemal::Handler
    REACT_ASSETS = "assets/react"
    INDEX_HTML   = "index.html"

    def call(context)
      return call_next(context) unless context.request.method == "GET"
      return call_next(context) if context.request.path.starts_with?("/api")
      return call_next(context) if context.request.path.starts_with?("/vi/")
      return call_next(context) if context.request.path.starts_with?("/ggpht/")
      return call_next(context) if context.request.path.starts_with?("/videoplayback")
      return call_next(context) if context.request.path.starts_with?("/latest_version")
      return call_next(context) if context.request.path.starts_with?("/companion")
      return call_next(context) if context.request.path.starts_with?("/api/manifest")
      return call_next(context) if context.request.path.starts_with?("/sb/")
      return call_next(context) if context.request.path.starts_with?("/s_p/")
      return call_next(context) if context.request.path.starts_with?("/yts/")
      return call_next(context) if context.request.path.starts_with?("/opensearch")
      return call_next(context) if context.request.path == "/favicon.ico"
      return call_next(context) if context.request.path.starts_with?("/apple-touch-icon")
      return call_next(context) if context.request.path.starts_with?("/favicon")
      return call_next(context) if context.request.path.starts_with?("/site.webmanifest")
      return call_next(context) if context.request.path.starts_with?("/safari-pinned-tab")

      # Serve static assets from React build (e.g. /assets/index-xxx.js -> assets/react/assets/xxx.js)
      if context.request.path.starts_with?("/assets/")
        path = context.request.path.lchop("/")
        file_path = File.join(REACT_ASSETS, path)
        if File.file?(file_path)
          context.response.content_type = MIME.from_filename(file_path, "application/octet-stream")
          context.response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
          File.open(file_path) { |f| IO.copy(f, context.response.output) }
          return
        end
      end

      # Serve index.html for SPA routes (client-side routing)
      index_path = File.join(REACT_ASSETS, INDEX_HTML)
      if File.file?(index_path)
        context.response.content_type = "text/html"
        context.response.headers["Cache-Control"] = "no-cache"
        File.open(index_path) { |f| IO.copy(f, context.response.output) }
        return
      end

      call_next(context)
    end
  end
end
