# Build frontend
npm --prefix frontend ci
npm --prefix frontend run build

# Copy frontend dist to Flask static folder (optional)
mkdir -p public
cp -r frontend/dist/* public/ || true
