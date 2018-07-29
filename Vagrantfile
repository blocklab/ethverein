Vagrant.configure("2") do |config|
  
  config.vm.box = "ubuntu/trusty64"
  config.vm.synced_folder ".", "/home/vagrant/ethverein"
  config.vm.network "private_network", ip: "192.168.77.7"
  config.vm.network :forwarded_port, guest: 4200, host: 4200
  config.vm.network :forwarded_port, guest: 9545, host: 9545

  # HW config 
  config.vm.provider "virtualbox" do |v|
    host = RbConfig::CONFIG['host_os']
    mem = 3072
    if host =~ /darwin/
      # mac
      cpus = `sysctl -n hw.ncpu`.to_i
    elsif host =~ /linux/
      # linux
      cpus = `nproc`.to_i
    else
      cpus = 4
    end
    v.customize ["modifyvm", :id, "--memory", mem]
    v.customize ["modifyvm", :id, "--cpus", cpus]
    v.customize ["guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 1000]
  end

  config.vm.provision :shell, path: "bootstrap.sh"

end
