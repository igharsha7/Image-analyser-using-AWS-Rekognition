export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* About */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">
              AI Image Analyzer uses AWS Rekognition to detect labels, faces, and attributes in your images.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Google Drive Integration</li>
              <li>Face Detection & Analysis</li>
              <li>Advanced Search & Filtering</li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Info</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, React, and AWS Rekognition for powerful image analysis.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 AI Image Analyzer. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
