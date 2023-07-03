function npmIfNeeded(pkg) {
  const [packageName, version] = pkg.split('@');

  const exists = () => {
    try {
      require(`${packageName}/package.json`);
      return true;
    } catch {
      return false;
    }
  };

  if (!exists() || require(`${packageName}/package.json`).version !== version) {
    console.log(`${pkg} installing`);
    require('child_process').execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  } else {
    console.log(`${pkg} is installed`);
  }
}

npmIfNeeded('onoff@6.0.3');
npmIfNeeded('sequelize@6.32.1');
npmIfNeeded('sequelize@6.32.1');
npmIfNeeded('sqlite3@5.1.6');
npmIfNeeded('fastify-cli@5.7.1');
